create table roles (
	id UUID DEFAULT gen_random_uuid() PRIMARY KEY, 
	role VARCHAR(100)
	created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);