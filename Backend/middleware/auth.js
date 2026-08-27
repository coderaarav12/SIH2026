import { verify } from "jsonwebtoken";

const auth = async (c, next) => {
  const header = c.req.header("Authorization") || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;

  if (!token) {
    return c.json({ success: false, message: "Authorization token required" }, 401);
  }

  try {
    const payload = verify(token, c.env.JWT_SECRET || "syncmasters-demo-secret");
    const user = await c.env.DB.prepare(
      "SELECT id, name, email, role, department, created_at FROM users WHERE id = ?"
    ).bind(payload.id).first();

    if (!user) {
      return c.json({ success: false, message: "User no longer exists" }, 401);
    }

    c.set("user", user);
    await next();
  } catch (error) {
    return c.json({ success: false, message: "Invalid or expired token" }, 401);
  }
};

export default auth;
