## FEATURES DESCRIPTION

#### Middleware

- Authenticated User
- Role (Admin/Lead/User)

#### Authentication

- Authentication by JWT
- Save active token and black-list token in Redis
- Token includes User Id & Role (Admin/Lead/User)

#### Register

- Unique email, hard password
- Verify user by Email by Nodemailer/SMTP (save verify-code in Redis)

#### Data

...

## INSTALL (Ubuntu) to auto deploy by Github-action

#### Install node 18

`curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash - &&\
sudo apt-get install -y nodejs`

`sudo ufw enable`

`sudo ufw allow 3000`

#### Install git

`sudo yum update -y (sudo apt-get update)`

`sudo yum install git -y (sudo apt-get install git)`

`git version`

#### Install mongodb

...

### Run app in background using PM2

`sudo npm i pm2 -g`

#### Clone repo

`git clone https://github.com/chinhvnn/blog-expressjs.git`

`npm i`

`sudo pm2 start ./src/bin/www.ts --name <demo-name>`
