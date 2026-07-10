const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const supabase = require("../config/supabase");

const register = async (req, res) => {
    try {
        const { name, email, password, role } = req.body;

        // 1. check missing fields
        if (!name || !email || !password || !role) {
            return res.status(400).json({ message: "All fields are required" });
        }

        // 2. check if user exists
        const { data: existingUser } = await supabase
            .from("users")
            .select("*")
            .eq("email", email)
            .single();

        if (existingUser) {
            return res.status(400).json({ message: "User already exists" });
        }

        // 3. hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // 4. insert user into DB
        const { data, error } = await supabase
            .from("users")
            .insert([
                {
                    name,
                    email,
                    password: hashedPassword,
                    role
                }
            ])
            .select();

        if (error) {
            return res.status(500).json({ message: error.message });
        }

        res.status(201).json({
            message: "User registered successfully",
            user: data[0]
        });

    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // 1. find user
        const { data: user } = await supabase
            .from("users")
            .select("*")
            .eq("email", email)
            .single();

        if (!user) {
            return res.status(400).json({ message: "User not found" });
        }

        // 2. check password
        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(400).json({ message: "Invalid credentials" });
        }

        // 3. create JWT
        const token = jwt.sign(
            { id: user.id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: "7d" }
        );

        res.json({
            message: "Login successful",
            token,
            user
        });

    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
module.exports = { register, login };