-- Prompt IQ Database Migration
-- Migration from Firestore to Neon Postgres
-- Created: 2024

-- Enable UUID extension for generating UUIDs
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (replaces Firestore users collection)
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    firebase_uid VARCHAR(128) UNIQUE NOT NULL, -- Firebase Auth UID
    email VARCHAR(255) NOT NULL,
    credits INTEGER DEFAULT 5, -- Backward compatibility
    used_credits INTEGER DEFAULT 0, -- Backward compatibility
    subscription_tier VARCHAR(50) DEFAULT 'free',
    subscription_plan_id VARCHAR(50),
    subscription_credits INTEGER DEFAULT 5,
    subscription_used_credits INTEGER DEFAULT 0,
    subscription_start TIMESTAMP WITH TIME ZONE,
    subscription_end TIMESTAMP WITH TIME ZONE,
    billing_cycle VARCHAR(20), -- 'monthly' or 'yearly'
    last_payment_id VARCHAR(255),
    last_payment_date TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Prompts table (replaces Firestore prompts collection)
CREATE TABLE prompts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    firebase_uid VARCHAR(128) NOT NULL, -- For backward compatibility
    original_prompt TEXT NOT NULL,
    enhanced_prompt TEXT NOT NULL,
    source VARCHAR(50) DEFAULT 'dashboard', -- 'dashboard', 'playground', etc.
    credits_used INTEGER DEFAULT 1,
    plan_id VARCHAR(50),
    subscription_credits INTEGER,
    subscription_used_credits INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Library table (replaces users/{userId}/library subcollection)
CREATE TABLE library (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    firebase_uid VARCHAR(128) NOT NULL, -- For backward compatibility
    title VARCHAR(255),
    content TEXT NOT NULL,
    category VARCHAR(100),
    order_index INTEGER DEFAULT 0,
    is_favorite BOOLEAN DEFAULT FALSE,
    usage_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Folders table (replaces users/{userId}/folders subcollection)
CREATE TABLE folders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    firebase_uid VARCHAR(128) NOT NULL, -- For backward compatibility
    name VARCHAR(255) NOT NULL,
    description TEXT,
    color VARCHAR(7), -- Hex color code
    order_index INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- History table (replaces users/{userId}/history subcollection)
CREATE TABLE history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    firebase_uid VARCHAR(128) NOT NULL, -- For backward compatibility
    action VARCHAR(100) NOT NULL, -- 'prompt_enhanced', 'library_added', etc.
    details JSONB, -- Store additional details as JSON
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Playground table (replaces users/{userId}/playground subcollection)
CREATE TABLE playground (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    firebase_uid VARCHAR(128) NOT NULL, -- For backward compatibility
    session_name VARCHAR(255),
    prompts JSONB NOT NULL, -- Store array of prompts and responses
    model_settings JSONB, -- Store model configuration
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Payments table (replaces Firestore payments collection)
CREATE TABLE payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    firebase_uid VARCHAR(128) NOT NULL, -- For backward compatibility
    user_email VARCHAR(255) NOT NULL,
    razorpay_order_id VARCHAR(255) NOT NULL,
    razorpay_payment_id VARCHAR(255) NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'INR',
    plan_id VARCHAR(50) NOT NULL,
    plan_name VARCHAR(255) NOT NULL,
    billing_cycle VARCHAR(20) NOT NULL,
    credits INTEGER NOT NULL,
    status VARCHAR(50) DEFAULT 'completed',
    subscription_start TIMESTAMP WITH TIME ZONE NOT NULL,
    subscription_end TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Feedback table (replaces Firestore feedback collection)
CREATE TABLE feedback (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    firebase_uid VARCHAR(128), -- Optional, for anonymous feedback
    email VARCHAR(255),
    subject VARCHAR(255),
    message TEXT NOT NULL,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    page_url VARCHAR(500),
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Email subscriptions table (replaces Firestore email_subscriptions collection)
CREATE TABLE email_subscriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    source VARCHAR(100), -- 'waitlist', 'newsletter', etc.
    status VARCHAR(50) DEFAULT 'active', -- 'active', 'unsubscribed'
    metadata JSONB, -- Store additional subscription data
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_users_firebase_uid ON users(firebase_uid);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_prompts_user_id ON prompts(user_id);
CREATE INDEX idx_prompts_firebase_uid ON prompts(firebase_uid);
CREATE INDEX idx_prompts_created_at ON prompts(created_at DESC);
CREATE INDEX idx_library_user_id ON library(user_id);
CREATE INDEX idx_library_firebase_uid ON library(firebase_uid);
CREATE INDEX idx_library_category ON library(category);
CREATE INDEX idx_library_order ON library(order_index);
CREATE INDEX idx_folders_user_id ON folders(user_id);
CREATE INDEX idx_folders_firebase_uid ON folders(firebase_uid);
CREATE INDEX idx_history_user_id ON history(user_id);
CREATE INDEX idx_history_firebase_uid ON history(firebase_uid);
CREATE INDEX idx_playground_user_id ON playground(user_id);
CREATE INDEX idx_playground_firebase_uid ON playground(firebase_uid);
CREATE INDEX idx_payments_user_id ON payments(user_id);
CREATE INDEX idx_payments_firebase_uid ON payments(firebase_uid);
CREATE INDEX idx_payments_razorpay_payment_id ON payments(razorpay_payment_id);
CREATE INDEX idx_feedback_user_id ON feedback(user_id);
CREATE INDEX idx_email_subscriptions_email ON email_subscriptions(email);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at columns
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_library_updated_at BEFORE UPDATE ON library FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_folders_updated_at BEFORE UPDATE ON folders FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_playground_updated_at BEFORE UPDATE ON playground FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_email_subscriptions_updated_at BEFORE UPDATE ON email_subscriptions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
