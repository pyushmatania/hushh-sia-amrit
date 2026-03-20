
ALTER TABLE referral_uses DROP CONSTRAINT IF EXISTS referral_uses_referred_user_id_fkey;
ALTER TABLE referral_uses DROP CONSTRAINT IF EXISTS referral_uses_referrer_user_id_fkey;

INSERT INTO referral_uses (code_id, referred_user_id, referrer_user_id, credited) VALUES
('fedfb0b4-7c93-42e1-bf47-4c627357b177', 'a1b2c3d4-0001-4000-8000-000000000004', 'a1b2c3d4-0001-4000-8000-000000000001', true),
('fedfb0b4-7c93-42e1-bf47-4c627357b177', 'a1b2c3d4-0001-4000-8000-000000000006', 'a1b2c3d4-0001-4000-8000-000000000001', true),
('42cec997-0cfe-451d-9142-e561912a3191', 'a1b2c3d4-0001-4000-8000-000000000007', 'a1b2c3d4-0001-4000-8000-000000000003', true),
('a96fa867-7d4c-4192-9ab4-9bfb509a407d', 'a1b2c3d4-0001-4000-8000-000000000008', 'a1b2c3d4-0001-4000-8000-000000000005', true),
('a96fa867-7d4c-4192-9ab4-9bfb509a407d', 'a1b2c3d4-0001-4000-8000-000000000009', 'a1b2c3d4-0001-4000-8000-000000000005', true),
('e713a151-1150-4d58-b779-e2f357ecb1fe', 'a1b2c3d4-0001-4000-8000-000000000010', 'a1b2c3d4-0001-4000-8000-000000000002', false);

ALTER TABLE referral_uses ADD CONSTRAINT referral_uses_referred_user_id_fkey FOREIGN KEY (referred_user_id) REFERENCES auth.users(id) ON DELETE CASCADE NOT VALID;
ALTER TABLE referral_uses ADD CONSTRAINT referral_uses_referrer_user_id_fkey FOREIGN KEY (referrer_user_id) REFERENCES auth.users(id) ON DELETE CASCADE NOT VALID;
