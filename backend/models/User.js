const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Esquema para perfil de usuario
const profileSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: true,
    trim: true,
    maxlength: 50
  },
  lastName: {
    type: String,
    required: true,
    trim: true,
    maxlength: 50
  },
  avatar: {
    type: String,
    trim: true
  },
  phone: {
    type: String,
    trim: true,
    validate: {
      validator: function(v) {
        return !v || /^[\+]?[\d\s\-\(\)]+$/.test(v);
      },
      message: 'Formato de teléfono inválido'
    }
  }
}, { _id: false });

// Esquema para preferencias de usuario
const preferencesSchema = new mongoose.Schema({
  theme: {
    type: String,
    enum: ['light', 'dark'],
    default: 'light'
  },
  language: {
    type: String,
    enum: ['es', 'en'],
    default: 'es'
  },
  timezone: {
    type: String,
    default: 'America/Bogota'
  },
  notifications: {
    email: {
      type: Boolean,
      default: true
    },
    browser: {
      type: Boolean,
      default: true
    },
    lowStock: {
      type: Boolean,
      default: true
    },
    overdueInvoices: {
      type: Boolean,
      default: true
    }
  }
}, { _id: false });

// Esquema principal de Usuarios
const userSchema = new mongoose.Schema({
  userId: {
    type: String,
    unique: true,
    required: true
  },
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: 3,
    maxlength: 30,
    validate: {
      validator: function(v) {
        return /^[a-zA-Z0-9_]+$/.test(v);
      },
      message: 'El username solo puede contener letras, números y guión bajo'
    }
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
    validate: {
      validator: function(v) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
      },
      message: 'Formato de email inválido'
    }
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  profile: {
    type: profileSchema,
    required: true
  },
  role: {
    type: String,
    enum: ['admin', 'manager', 'employee', 'viewer'],
    required: true,
    default: 'employee'
  },
  permissions: [{
    type: String,
    enum: [
      'suppliers:read', 'suppliers:write', 'suppliers:delete',
      'clients:read', 'clients:write', 'clients:delete',
      'products:read', 'products:write', 'products:delete',
      'invoices:read', 'invoices:write', 'invoices:delete',
      'users:read', 'users:write', 'users:delete',
      'reports:read', 'reports:write',
      'dashboard:read',
      'settings:read', 'settings:write'
    ]
  }],
  preferences: {
    type: preferencesSchema,
    default: {}
  },
  lastLogin: {
    type: Date
  },
  isEmailVerified: {
    type: Boolean,
    default: false
  },
  emailVerificationToken: {
    type: String
  },
  passwordResetToken: {
    type: String
  },
  passwordResetExpires: {
    type: Date
  },
  loginAttempts: {
    type: Number,
    default: 0
  },
  lockUntil: {
    type: Date
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'suspended'],
    default: 'active'
  }
}, {
  timestamps: true
});

// Middleware para generar userId automáticamente
userSchema.pre('save', async function(next) {
  if (!this.userId) {
    const count = await mongoose.model('User').countDocuments();
    this.userId = `USER-${String(count + 1).padStart(3, '0')}`;
  }
  next();
});

// Middleware para hashear la contraseña
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Middleware para asignar permisos por rol
userSchema.pre('save', function(next) {
  if (this.isModified('role')) {
    switch (this.role) {
      case 'admin':
        this.permissions = [
          'suppliers:read', 'suppliers:write', 'suppliers:delete',
          'clients:read', 'clients:write', 'clients:delete',
          'products:read', 'products:write', 'products:delete',
          'invoices:read', 'invoices:write', 'invoices:delete',
          'users:read', 'users:write', 'users:delete',
          'reports:read', 'reports:write',
          'dashboard:read',
          'settings:read', 'settings:write'
        ];
        break;
      case 'manager':
        this.permissions = [
          'suppliers:read', 'suppliers:write',
          'clients:read', 'clients:write',
          'products:read', 'products:write',
          'invoices:read', 'invoices:write',
          'users:read',
          'reports:read',
          'dashboard:read'
        ];
        break;
      case 'employee':
        this.permissions = [
          'suppliers:read',
          'clients:read', 'clients:write',
          'products:read',
          'invoices:read', 'invoices:write',
          'dashboard:read'
        ];
        break;
      case 'viewer':
        this.permissions = [
          'suppliers:read',
          'clients:read',
          'products:read',
          'invoices:read',
          'dashboard:read'
        ];
        break;
    }
  }
  next();
});

// Índices
userSchema.index({ username: 1 });
userSchema.index({ email: 1 });
userSchema.index({ userId: 1 });
userSchema.index({ status: 1 });
userSchema.index({ role: 1 });

// Propiedades virtuales
userSchema.virtual('isLocked').get(function() {
  return !!(this.lockUntil && this.lockUntil > Date.now());
});

userSchema.virtual('profile.fullName').get(function() {
  return `${this.profile.firstName} ${this.profile.lastName}`;
});

// Métodos del esquema
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.incrementLoginAttempts = function() {
  // Si tenemos un lock previo y ha expirado, reiniciar intentos
  if (this.lockUntil && this.lockUntil < Date.now()) {
    return this.updateOne({
      $unset: { lockUntil: 1, loginAttempts: 1 }
    });
  }
  
  const updates = { $inc: { loginAttempts: 1 } };
  
  // Si alcanzamos el máximo de intentos y no estamos bloqueados, bloquear cuenta
  if (this.loginAttempts + 1 >= 5 && !this.isLocked) {
    updates.$set = {
      lockUntil: Date.now() + (2 * 60 * 60 * 1000) // 2 horas
    };
  }
  
  return this.updateOne(updates);
};

userSchema.methods.resetLoginAttempts = function() {
  return this.updateOne({
    $unset: { loginAttempts: 1, lockUntil: 1 }
  });
};

userSchema.methods.updateLastLogin = function() {
  this.lastLogin = new Date();
  return this.save();
};

userSchema.methods.hasPermission = function(permission) {
  return this.permissions.includes(permission);
};

userSchema.methods.generatePasswordResetToken = function() {
  const crypto = require('crypto');
  const resetToken = crypto.randomBytes(32).toString('hex');
  
  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');
  
  this.passwordResetExpires = Date.now() + 10 * 60 * 1000; // 10 minutos
  
  return resetToken;
};

// Métodos estáticos
userSchema.statics.findByRole = function(role) {
  return this.find({ role, status: 'active' });
};

userSchema.statics.findActive = function() {
  return this.find({ status: 'active' });
};

const User = mongoose.model('User', userSchema);

module.exports = User;
