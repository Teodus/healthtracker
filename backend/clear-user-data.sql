-- Clear user data for today
-- This script will delete all food entries, workouts, and habit completions for today

-- Get the user ID (you can replace this with a specific user ID if needed)
DO $$
DECLARE
    user_id UUID;
BEGIN
    -- Get a user ID (adjust the email if needed)
    SELECT id INTO user_id FROM users WHERE email = 'test2@example.com' LIMIT 1;
    
    IF user_id IS NOT NULL THEN
        -- Delete today's food entries
        DELETE FROM food_entries 
        WHERE user_id = user_id 
        AND DATE(created_at) = CURRENT_DATE;
        
        -- Delete today's workouts
        DELETE FROM workouts 
        WHERE user_id = user_id 
        AND DATE(created_at) = CURRENT_DATE;
        
        -- Delete today's habit completions
        DELETE FROM habit_completions 
        WHERE habit_id IN (SELECT id FROM habits WHERE user_id = user_id)
        AND DATE(completed_at) = CURRENT_DATE;
        
        -- Delete today's daily summaries
        DELETE FROM daily_summaries 
        WHERE user_id = user_id 
        AND date = CURRENT_DATE;
        
        RAISE NOTICE 'Cleared data for user %', user_id;
    ELSE
        RAISE NOTICE 'User not found';
    END IF;
END $$;