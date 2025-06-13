// supabase.js
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const SUPABASE_URL = 'https://mibewcycqmmwxggyjxdg.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1pYmV3Y3ljcW1td3hnZ3lqeGRnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDgxOTU1NTgsImV4cCI6MjA2Mzc3MTU1OH0.yPYCo0VmWb_tTaZepTUKMNlj8x8fdxFAMzjjvAUUfrk';

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);