jest.mock('../src/db',()=>({query:jest.fn()}));
const request=require('supertest');const pool=require('../src/db');const app=require('../src/app');
beforeEach(()=>pool.query.mockReset());
test('health returns ok when DB works',async()=>{pool.query.mockResolvedValue({rows:[{ '?column?':1 }]});const r=await request(app).get('/api/health');expect(r.status).toBe(200);expect(r.body.status).toBe('ok');});
test('health returns 503 when DB fails',async()=>{pool.query.mockRejectedValue(new Error('down'));const r=await request(app).get('/api/health');expect(r.status).toBe(503);});
test('services follows API contract',async()=>{pool.query.mockResolvedValue({rows:[{id:1,name:'อาบน้ำ',duration_minutes:60,price_thb:300}]});const r=await request(app).get('/api/services');expect(r.status).toBe(200);expect(r.body).toEqual([{id:1,name:'อาบน้ำ',durationMinutes:60,priceThb:300}]);});
test('bookings require authentication',async()=>{const r=await request(app).post('/api/bookings').send({});expect(r.status).toBe(401);expect(r.body.code).toBe('UNAUTHORIZED');});
test('invalid availability input rejected',async()=>{const r=await request(app).get('/api/availability?date=bad&serviceId=1');expect(r.status).toBe(400);});
