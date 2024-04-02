#### Installation
1. Install `Postgresql` into your system.
2. Create a database named `guggleweed` and run the following script in that database
   ```sql
   create database users(username varchar(32) primary key, password varchar(256) not null);
   ```
3. Clone this repository.
4. In `/lib/database.ts`, configure the connection pool by your `Postgresql` settings:
   ```JS
   const pool = new Pool({
     host: "localhost",
     database: "guggleweed",
     user: "<your-postgresql-username>",
     password: "<you-postgresql-password>"
   });
   ```
5. Run `pnpm install` and `pnpm dev`.