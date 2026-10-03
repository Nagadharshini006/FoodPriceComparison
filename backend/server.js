const express = require('express');
const path = require('path');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const db = require('./db');
const { authenticate, adminOnly } = require('./middleware');

const app = express();
const PORT = Number(process.env.PORT || 5000);
const JWT_SECRET = process.env.JWT_SECRET || 'development-secret-change-me';

app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, '..', 'frontend')));

function tokenFor(user) {
  return jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
}

app.get('/api/health', async (req, res) => {
  try {
    await db.query('SELECT 1');
    res.json({ ok: true, message: 'Backend and MySQL are connected' });
  } catch (err) {
    res.status(500).json({ ok: false, message: 'Database connection failed', error: err.message });
  }
});

// Demo-friendly user login: if email does not exist, the account is created.
app.post('/api/auth/login', async (req, res) => {
  try {
    const email = String(req.body.email || '').trim().toLowerCase();
    const password = String(req.body.password || '');
    if (!email || !password || password.length < 3) return res.status(400).json({ message: 'Valid email and password are required' });

    const [rows] = await db.query('SELECT id, email, password_hash, role FROM users WHERE email = ?', [email]);
    let user = rows[0];

    if (!user) {
      const hash = await bcrypt.hash(password, 10);
      const [result] = await db.query('INSERT INTO users (email, password_hash, role) VALUES (?, ?, ?)', [email, hash, 'user']);
      user = { id: result.insertId, email, password_hash: hash, role: 'user' };
    } else if (!(await bcrypt.compare(password, user.password_hash))) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    res.json({ token: tokenFor(user), user: { id: user.id, email: user.email, role: user.role } });
  } catch (err) {
    res.status(500).json({ message: 'Login failed', error: err.message });
  }
});

app.post('/api/auth/admin-login', async (req, res) => {
  try {
    const username = String(req.body.username || '').trim().toLowerCase();
    const password = String(req.body.password || '');
    const email = username === 'admin' ? 'admin@foodcomparator.local' : username;
    const [rows] = await db.query('SELECT id, email, password_hash, role FROM users WHERE email = ? AND role = \'admin\'', [email]);
    const user = rows[0];
    if (!user || !(await bcrypt.compare(password, user.password_hash))) return res.status(401).json({ message: 'Invalid admin credentials' });
    res.json({ token: tokenFor(user), user: { id: user.id, email: user.email, role: user.role } });
  } catch (err) {
    res.status(500).json({ message: 'Admin login failed', error: err.message });
  }
});

app.get('/api/me', authenticate, (req, res) => res.json({ user: req.user }));
// ================================
// FOOD SEARCH BY LOCATION
// ================================

app.get('/api/food/search', authenticate, async (req, res) => {
  try {
    const food = String(req.query.food || '').trim().toLowerCase();
    const state = String(req.query.state || '').trim();
    const city = String(req.query.city || '').trim();
    const area = String(req.query.area || '').trim();

    if (!food || !state || !city || !area) {
      return res.status(400).json({
        message: 'Food, state, city and area are required'
      });
    }

    const [rows] = await db.query(
      `SELECT
        id,
        food_name AS foodName,
        platform,
        restaurant,
        state,
        city,
        area,
        price,
        rating,
        delivery_time AS deliveryTime,
        reviews,
        order_url AS orderUrl
      FROM food_items
     WHERE LOWER(food_name) LIKE CONCAT('%', ?, '%')
        AND state = ?
        AND city = ?
        AND area = ?
      ORDER BY platform`,
      [food, state, city, area]
    );

    res.json({
      success: true,
      food,
      location: {
        state,
        city,
        area
      },
      results: rows
    });

  } catch (err) {
    console.error('Food search error:', err);

    res.status(500).json({
      success: false,
      message: 'Could not search food',
      error: err.message
    });
  }
});

app.post('/api/comparisons', authenticate, async (req, res) => {
  try {
    const { foodName, location, foodData, winner } = req.body;
    if (!foodName || !location?.state || !location?.city || !location?.area || !foodData?.zomato || !foodData?.swiggy) {
      return res.status(400).json({ message: 'Incomplete comparison data' });
    }
    const [result] = await db.query(
      `INSERT INTO comparisons
      (user_id, food_name, state, city, area, zomato_restaurant, zomato_price, zomato_rating, zomato_delivery, swiggy_restaurant, swiggy_price, swiggy_rating, swiggy_delivery, winner)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [req.user.id, foodName, location.state, location.city, location.area,
       foodData.zomato.restaurant, foodData.zomato.price, foodData.zomato.rating, foodData.zomato.deliveryTime,
       foodData.swiggy.restaurant, foodData.swiggy.price, foodData.swiggy.rating, foodData.swiggy.deliveryTime, winner]
    );
    res.status(201).json({ id: result.insertId, message: 'Comparison saved' });
  } catch (err) {
    res.status(500).json({ message: 'Could not save comparison', error: err.message });
  }
});
// ================================
// SAVE / UNSAVE FAVOURITE
// ================================

app.put('/api/comparisons/:id/favorite', authenticate, async (req, res) => {
  try {
    const comparisonId = Number(req.params.id);
    const isFavorite = Boolean(req.body.isFavorite);

    if (!comparisonId) {
      return res.status(400).json({
        message: 'Invalid comparison ID'
      });
    }

    const [result] = await db.query(
      `UPDATE comparisons
       SET is_favorite = ?
       WHERE id = ? AND user_id = ?`,
      [isFavorite, comparisonId, req.user.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        message: 'Comparison not found'
      });
    }

    res.json({
      success: true,
      isFavorite: isFavorite,
      message: isFavorite
        ? 'Added to favourites'
        : 'Removed from favourites'
    });

  } catch (err) {
    console.error('Favourite update error:', err);

    res.status(500).json({
      message: 'Could not update favourite',
      error: err.message
    });
  }
});


// ================================
// GET SAVED / FAVOURITE COMPARISONS
// ================================

app.get('/api/comparisons/saved', authenticate, async (req, res) => {
  try {

    const [rows] = await db.query(`
      SELECT
        id,
        food_name AS foodName,
        state,
        city,
        area,

        zomato_restaurant AS zomatoRestaurant,
        zomato_price AS zomatoPrice,
        zomato_rating AS zomatoRating,
        zomato_delivery AS zomatoDelivery,

        swiggy_restaurant AS swiggyRestaurant,
        swiggy_price AS swiggyPrice,
        swiggy_rating AS swiggyRating,
        swiggy_delivery AS swiggyDelivery,

        winner,
        is_favorite AS isFavorite,
        created_at AS createdAt

      FROM comparisons

      WHERE user_id = ?
      AND is_favorite = TRUE

      ORDER BY created_at DESC
    `, [req.user.id]);

    res.json(rows);

  } catch (err) {

    console.error('Could not load saved comparisons:', err);

    res.status(500).json({
      message: 'Could not load saved comparisons',
      error: err.message
    });
  }
});
app.get('/api/comparisons/my', authenticate, async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT
        food_name AS foodName,
        state,
        city,
        area,
        zomato_restaurant AS zomatoRestaurant,
        zomato_price AS zomatoPrice,
        zomato_rating AS zomatoRating,
        zomato_delivery AS zomatoDelivery,
        swiggy_restaurant AS swiggyRestaurant,
        swiggy_price AS swiggyPrice,
        swiggy_rating AS swiggyRating,
        swiggy_delivery AS swiggyDelivery,
        winner,
        created_at AS createdAt
      FROM comparisons
      WHERE user_id = ?
      ORDER BY created_at DESC
    `, [req.user.id]);

    res.json(rows);

  } catch (err) {
    console.error('Could not load comparisons:', err);

    res.status(500).json({
      message: 'Could not load saved comparisons',
      error: err.message
    });
  }
});

app.post('/api/orders', authenticate, async (req, res) => {
  try {
    const { foodName, platform, foodData, location } = req.body;
    if (!foodName || !['zomato', 'swiggy'].includes(platform) || !foodData?.[platform] || !location?.state || !location?.city || !location?.area) {
      return res.status(400).json({ message: 'Incomplete order data' });
    }
    const p = foodData[platform];
    const orderUrl = p.orderUrl || '';
    const [result] = await db.query(
      `INSERT INTO orders
      (user_id, food_item, platform, restaurant, price, rating, delivery_time, state, city, area, order_url)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [req.user.id, foodName, platform, p.restaurant, p.price, p.rating, p.deliveryTime,
       location.state, location.city, location.area, orderUrl]
    );
    res.status(201).json({ orderId: result.insertId, message: 'Order saved' });
  } catch (err) {
    res.status(500).json({ message: 'Could not save order', error: err.message });
  }
});

app.get('/api/orders/my', authenticate, async (req, res) => {
  try {
    const [rows] = await db.query(`SELECT id, food_item AS foodItem, platform, restaurant, price, rating, delivery_time AS deliveryTime,
      CONCAT(area, ', ', city, ', ', state) AS location, order_url AS orderUrl, created_at AS timestamp
      FROM orders WHERE user_id = ? ORDER BY created_at DESC`, [req.user.id]);
    res.json(rows);
  } catch (err) { res.status(500).json({ message: 'Could not load orders', error: err.message }); }
});

app.get('/api/admin/orders', authenticate, adminOnly, async (req, res) => {
  try {
    const [rows] = await db.query(`SELECT o.id AS orderId, u.email AS userEmail, o.food_item AS foodItem, o.platform,
      o.restaurant, o.price, o.rating, o.delivery_time AS deliveryTime,
      CONCAT(o.area, ', ', o.city, ', ', o.state) AS location, o.created_at AS timestamp
      FROM orders o JOIN users u ON u.id = o.user_id ORDER BY o.created_at DESC`);
    res.json(rows);
  } catch (err) { res.status(500).json({ message: 'Could not load admin orders', error: err.message }); }
});

app.delete('/api/admin/orders', authenticate, adminOnly, async (req, res) => {
  try { await db.query('DELETE FROM orders'); res.json({ message: 'All orders deleted' }); }
  catch (err) { res.status(500).json({ message: 'Could not clear orders', error: err.message }); }
});

app.get('/api/admin/stats', authenticate, adminOnly, async (req, res) => {
  try {
    const [[{ totalOrders }]] = await db.query('SELECT COUNT(*) totalOrders FROM orders');
    const [[{ totalUsers }]] = await db.query("SELECT COUNT(*) totalUsers FROM users WHERE role = 'user'");
    const [[{ zomatoOrders }]] = await db.query("SELECT COUNT(*) zomatoOrders FROM orders WHERE platform = 'zomato'");
    const [[{ swiggyOrders }]] = await db.query("SELECT COUNT(*) swiggyOrders FROM orders WHERE platform = 'swiggy'");
    res.json({ totalOrders: Number(totalOrders), totalUsers: Number(totalUsers), zomatoOrders: Number(zomatoOrders), swiggyOrders: Number(swiggyOrders) });
  } catch (err) { res.status(500).json({ message: 'Could not load statistics', error: err.message }); }
});

app.get('*', (req, res) => res.sendFile(path.join(__dirname, '..', 'frontend', 'login-simple.html')));

// Make sure comparisons.is_favorite exists (used by the saved/favourite routes).
// Safe to run every start: it only adds the column if missing and never
// changes or removes existing rows.
(async () => {
  try {
    const [cols] = await db.query("SHOW COLUMNS FROM comparisons LIKE 'is_favorite'");
    if (cols.length === 0) {
      await db.query('ALTER TABLE comparisons ADD COLUMN is_favorite BOOLEAN NOT NULL DEFAULT FALSE');
      console.log('Added comparisons.is_favorite column');
    }
  } catch (err) {
    console.error('Could not verify comparisons.is_favorite column:', err.message);
  }
})();

app.listen(PORT, () => console.log(`Food Comparator running at http://localhost:${PORT}`));
