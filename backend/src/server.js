require('dotenv').config();
if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32 || !process.env.DATABASE_URL) { console.error('Set JWT_SECRET (>=32 chars) and DATABASE_URL'); process.exit(1); }
const app=require('./app');
app.listen(process.env.PORT||3000,()=>console.log(`PetGrooming API on ${process.env.PORT||3000}`));
