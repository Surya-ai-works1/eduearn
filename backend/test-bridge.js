import "./configs/dnsConfig.js";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { bridgeSession } from "./controllers/authController.js";
import User from "./models/userModel.js";

// Mock environment variables for testing
process.env.JWT_SECRET = "test_jwt_secret_hash_value_123456";

// Mock Mongoose model methods
const mockUsers = [];

User.findOne = async (query) => {
    console.log("Mock User.findOne called for email:", query.email);
    return mockUsers.find(u => u.email === query.email) || null;
};

User.create = async (data) => {
    console.log("Mock User.create called with name:", data.name, "role:", data.role);
    const newUser = {
        _id: new mongoose.Types.ObjectId(),
        ...data,
        save: async function() {
            console.log("Mock User.save called on created user");
            return this;
        }
    };
    mockUsers.push(newUser);
    return newUser;
};

// Mock response object builder
const createMockResponse = () => {
    const res = {
        statusCode: 200,
        headers: {},
        cookies: {},
        status: function(code) {
            this.statusCode = code;
            return this;
        },
        json: function(data) {
            this.body = data;
            return this;
        },
        cookie: function(name, value, options) {
            this.cookies[name] = { value, options };
            return this;
        }
    };
    return res;
};

async function runTests() {
    console.log("=== RUNNING AUTH BRIDGE TESTS ===");

    // Test 1: Autocreate User with role learner
    console.log("\n--- Test 1: Autocreate Learner ---");
    const req1 = {
        body: {
            email: "student@example.com",
            name: "Jane Student",
            role: "learner",
            photoUrl: "http://example.com/photo.jpg"
        }
    };
    const res1 = createMockResponse();
    await bridgeSession(req1, res1);

    console.log("Status:", res1.statusCode);
    console.log("Body:", JSON.stringify(res1.body, null, 2));
    console.log("Cookies:", JSON.stringify(res1.cookies, null, 2));

    // Verify role mapping: learner -> student, and token exists
    const t1Passed = res1.body.role === "student" && res1.cookies.token && res1.body.email === "student@example.com";
    if (t1Passed) {
        console.log("✅ Test 1 PASSED");
    } else {
        console.error("❌ Test 1 FAILED");
    }

    // Test 2: Duplicate check / Update details
    console.log("\n--- Test 2: Update existing user details (tutor role) ---");
    const req2 = {
        body: {
            email: "student@example.com",
            name: "Jane Student Updated",
            role: "tutor", // Mapped to educator
            photoUrl: "http://example.com/photo2.jpg"
        }
    };
    const res2 = createMockResponse();
    
    // Setup found user with save mock
    const foundUser = mockUsers[0];
    foundUser.save = async function() {
        console.log("Mock User.save() called to persist changes");
        return this;
    };
    User.findOne = async () => foundUser;

    await bridgeSession(req2, res2);
    console.log("Status:", res2.statusCode);
    console.log("Body:", JSON.stringify(res2.body, null, 2));

    // Verify update (role mapped to educator, name changed)
    const t2Passed = res2.body.name === "Jane Student Updated" && res2.body.role === "educator";
    if (t2Passed) {
        console.log("✅ Test 2 PASSED");
    } else {
        console.error("❌ Test 2 FAILED");
    }

    console.log("\n=== ALL TESTS FINISHED ===");
    process.exit(t1Passed && t2Passed ? 0 : 1);
}

runTests().catch(err => {
    console.error("Test execution failed:", err);
    process.exit(1);
});
