create table users (
	id UUID DEFAULT gen_random_uuid() PRIMARY KEY, 
	role_id UUID not null, 
	email varchar(255), 
	username varchar(255), 
	full_name varchar(100),
	password text,
    created_by VARCHAR(255),
    active BOOLEAN DEFAULT false,
    login_attemp INT DEFAULT 5,
    is_dev BOOLEAN NOT null,

	created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ,
	
	CONSTRAINT fk_role_id FOREIGN KEY (role_id) REFERENCES roles(id),
	CONSTRAINT uq_email UNIQUE (email),
	CONSTRAINT uq_username UNIQUE (username)
);