-- ============================================================
-- Insert ek ACTIVE ADMIN aur ek ACTIVE AGENT — users table me
-- Password BCrypt me already hashed hai (column plain text accept nahi karta,
-- Spring Security BCryptPasswordEncoder use karta hai login ke time).
-- ============================================================

-- 1) ACTIVE ADMIN
-- Email   : admin2@insurance.com
-- Password: Admin@123
INSERT INTO users
    (full_name, email, password, mobile_number, role, active, created_date, updated_date, otp, otp_expiry_time)
VALUES
    ('System Admin Two', 'admin2@insurance.com',
     '$2b$12$ZaHwY6dricSHt0hLzLidDOIa562dmUbCplzuSMsMiPxgdKgr.L.au',
     '9000000001', 'ADMIN', true, NOW(), NOW(), NULL, NULL);

-- 2) ACTIVE AGENT
-- Email   : agent1@insurance.com
-- Password: Agent@123
INSERT INTO users
    (full_name, email, password, mobile_number, role, active, created_date, updated_date, otp, otp_expiry_time)
VALUES
    ('Default Agent', 'agent1@insurance.com',
     '$2b$12$jPwtI9NReZ58AwXNME9he.p0ig9Mybl27q/ieC73Y/bOC4FrVNcxy',
     '9000000002', 'AGENT', true, NOW(), NOW(), NULL, NULL);
