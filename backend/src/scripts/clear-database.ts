import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../../.env') });

async function clearUserData() {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Missing Supabase environment variables');
    process.exit(1);
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  try {
    // Get the user ID for theodore.casares@gmail.com
    const { data: users, error: userError } = await supabase
      .from('users')
      .select('id')
      .eq('email', 'theodore.casares@gmail.com')
      .limit(1);

    if (userError) throw userError;
    
    if (!users || users.length === 0) {
      console.log('User not found');
      return;
    }

    const userId = users[0].id;
    console.log(`Found user: ${userId}`);

    // Get today's date
    const today = new Date().toISOString().split('T')[0];

    // Delete today's food entries
    const { error: foodError, count: foodCount } = await supabase
      .from('food_entries')
      .delete()
      .eq('user_id', userId)
      .gte('created_at', `${today}T00:00:00`)
      .lt('created_at', `${today}T23:59:59`);

    if (foodError) throw foodError;
    console.log(`Deleted ${foodCount || 0} food entries`);

    // Delete today's workouts
    const { error: workoutError, count: workoutCount } = await supabase
      .from('workouts')
      .delete()
      .eq('user_id', userId)
      .gte('created_at', `${today}T00:00:00`)
      .lt('created_at', `${today}T23:59:59`);

    if (workoutError) throw workoutError;
    console.log(`Deleted ${workoutCount || 0} workouts`);

    // Get user's habits
    const { data: habits, error: habitsError } = await supabase
      .from('habits')
      .select('id')
      .eq('user_id', userId);

    if (habitsError) throw habitsError;

    if (habits && habits.length > 0) {
      const habitIds = habits.map(h => h.id);
      
      // Delete today's habit completions
      const { error: completionError, count: completionCount } = await supabase
        .from('habit_completions')
        .delete()
        .in('habit_id', habitIds)
        .gte('completed_at', `${today}T00:00:00`)
        .lt('completed_at', `${today}T23:59:59`);

      if (completionError) throw completionError;
      console.log(`Deleted ${completionCount || 0} habit completions`);
    }

    // Delete today's daily summaries
    const { error: summaryError, count: summaryCount } = await supabase
      .from('daily_summaries')
      .delete()
      .eq('user_id', userId)
      .eq('date', today);

    if (summaryError) throw summaryError;
    console.log(`Deleted ${summaryCount || 0} daily summaries`);

    console.log('\n✅ Successfully cleared all data for today!');
  } catch (error) {
    console.error('Error clearing data:', error);
    process.exit(1);
  }
}

clearUserData();