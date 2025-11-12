// init-mongo.js
// Script de inicialización para MongoDB

print('==============================');
print('Iniciando configuración de MongoDB para facturas_db');
print('==============================');

// Cambiar a la base de datos facturas_db
db = db.getSiblingDB('facturas_db');

// Crear usuario para facturas_db
db.createUser({
  user: 'facturas_user',
  pwd: 'facturas_pass',
  roles: [
    {
      role: 'readWrite',
      db: 'facturas_db'
    }
  ]
});

print('Usuario facturas_user creado exitosamente');

// Crear una colección inicial (opcional)
db.facturas.insertOne({
  _id: ObjectId(),
  numero: 'INIT-001',
  cliente: 'Sistema',
  fecha: new Date(),
  total: 0,
  estado: 'test',
  createdAt: new Date()
});

print('Colección facturas inicializada');
print('==============================');
print('Configuración de MongoDB completada');
print('==============================');