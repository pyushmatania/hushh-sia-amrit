
-- Temporarily drop FK constraints to seed data
ALTER TABLE wishlists DROP CONSTRAINT IF EXISTS wishlists_user_id_fkey;
ALTER TABLE review_responses DROP CONSTRAINT IF EXISTS review_responses_host_id_fkey;
ALTER TABLE spin_history DROP CONSTRAINT IF EXISTS spin_history_user_id_fkey;

-- Seed wishlists
INSERT INTO wishlists (user_id, property_id) VALUES
('a1b2c3d4-0001-4000-8000-000000000001', '1'),
('a1b2c3d4-0001-4000-8000-000000000001', '10'),
('a1b2c3d4-0001-4000-8000-000000000002', '3'),
('a1b2c3d4-0001-4000-8000-000000000002', '9'),
('a1b2c3d4-0001-4000-8000-000000000003', '4'),
('a1b2c3d4-0001-4000-8000-000000000004', '2'),
('a1b2c3d4-0001-4000-8000-000000000005', '1'),
('a1b2c3d4-0001-4000-8000-000000000005', '5'),
('a1b2c3d4-0001-4000-8000-000000000006', '7'),
('a1b2c3d4-0001-4000-8000-000000000007', '21');

-- Seed review responses
INSERT INTO review_responses (review_id, host_id, content) VALUES
('aa70b045-7b40-4e81-a508-0ea284ce8ffa', 'a1b2c3d4-0001-4000-8000-000000000001', 'Thank you so much! We loved having you. The bonfire nights are always special 🔥'),
('cb86a797-200e-4d7a-8252-8639186b3da8', 'a1b2c3d4-0001-4000-8000-000000000001', 'Glad you enjoyed the tribal thali! Our chef puts his heart into every dish 🍛'),
('7e5ece2b-a18d-4691-8288-29e14f6ce76e', 'a1b2c3d4-0001-4000-8000-000000000001', 'Your candlelight dinner photos were gorgeous! Hope to see you both again soon 💕'),
('94499f82-c795-447d-8320-bc4df33d5812', 'a1b2c3d4-0001-4000-8000-000000000001', 'Thanks! We have improved the speaker setup since your visit. Come try it out!'),
('44e02729-db64-4fde-b253-8b007eaa6ccc', 'a1b2c3d4-0001-4000-8000-000000000001', 'You are one of our most loyal guests! Diamond tier well deserved ⭐');

-- Seed spin history
INSERT INTO spin_history (user_id, points_won, prize_label, prize_emoji) VALUES
('a1b2c3d4-0001-4000-8000-000000000001', 50, '50 Points', '⭐'),
('a1b2c3d4-0001-4000-8000-000000000002', 10, '10 Points', '🎯'),
('a1b2c3d4-0001-4000-8000-000000000003', 100, '100 Points', '💎'),
('a1b2c3d4-0001-4000-8000-000000000004', 25, '25 Points', '🎁'),
('a1b2c3d4-0001-4000-8000-000000000005', 200, 'Jackpot!', '🏆'),
('a1b2c3d4-0001-4000-8000-000000000005', 50, '50 Points', '⭐'),
('a1b2c3d4-0001-4000-8000-000000000006', 10, 'Better luck!', '🍀'),
('a1b2c3d4-0001-4000-8000-000000000007', 75, '75 Points', '🌟');

-- Re-add FK constraints as NOT VALID
ALTER TABLE wishlists ADD CONSTRAINT wishlists_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE NOT VALID;
ALTER TABLE review_responses ADD CONSTRAINT review_responses_host_id_fkey FOREIGN KEY (host_id) REFERENCES auth.users(id) ON DELETE CASCADE NOT VALID;
ALTER TABLE spin_history ADD CONSTRAINT spin_history_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE NOT VALID;
