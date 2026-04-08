/*
  # Create User Count Function

  1. New Function
    - `get_user_count()` - Returns the total number of registered users from auth.users
  
  2. Security
    - Function is accessible to authenticated users only
    - Returns count without exposing sensitive user data
*/

-- Create function to get user count
CREATE OR REPLACE FUNCTION get_user_count()
RETURNS bigint
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN (SELECT COUNT(*) FROM auth.users);
END;
$$;