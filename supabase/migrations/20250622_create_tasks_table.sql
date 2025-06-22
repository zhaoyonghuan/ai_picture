-- Create a table to store and track image stylization tasks
create table if not exists tasks (
  id uuid primary key,
  status text not null default 'pending',
  -- Store the input parameters for the stylization task, like style, original image url etc.
  payload jsonb,
  -- Store the successful result from the AI service, like the stylized image URLs
  result jsonb,
  -- Store any error message if the task fails
  error text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Create a function to automatically update the `updated_at` timestamp on any row change
create or replace function handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Create a trigger to call the function before any update on the `tasks` table
create trigger on_task_update
  before update on tasks
  for each row
  execute procedure handle_updated_at(); 