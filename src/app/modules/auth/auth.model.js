const mongoose = require('mongoose');

// Define the schema
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'], // Validation: Required
    trim: true,
    minlength: [3, 'Name must be at least 3 characters long'],
    maxlength: [50, 'Name cannot exceed 50 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'], // Validation: Required
    trim: true,
    unique: true,
    match: [/\S+@\S+\.\S+/, 'Please provide a valid email address'] // Validation: Email format
  },
  password: {
    type: String,
    required: [true, 'Password is required'], // Validation: Required
    minlength: [6, 'Password must be at least 6 characters long']
  },
  confirmPassword: {
    type: String,
    required: [true, 'Confirm Password is required'], // Validation: Required
    validate: {
      validator: function (value) {
        return value === this.password; // Ensure passwords match
      },
      message: 'Passwords do not match'
    }
  },
  role: {
    type: String,
    enum: ['ADMIN', 'USER'], // Validation: Role must be one of the specified values
    required: [true, 'Role is required'], // Validation: Required
    default: 'USER'
  },
  address: {
    type: String,
    trim: true, // Optional field, no specific validation
    default: ''
  },
  dateOfBirth: {
    type: String, // Keep the input as String
    required: [true, 'Date of Birth is required'], // Validation: Required
    validate: {
      validator: function (value) {
        const minAge = 18; // Minimum age requirement
        const today = new Date();

        // Parse the string date (e.g., "16-11-1999") to a Date object
        const [day, month, year] = value.split('-');
        const birthDate = new Date(`${year}-${month}-${day}`); // Convert to YYYY-MM-DD format
        
        if (isNaN(birthDate)) return false; // Check if it's a valid date
        
        const age = today.getFullYear() - birthDate.getFullYear();
        const isBirthdayPassed =
          today.getMonth() > birthDate.getMonth() ||
          (today.getMonth() === birthDate.getMonth() && today.getDate() >= birthDate.getDate());
          
        return age > minAge || (age === minAge && isBirthdayPassed);
      },
      message: 'User must be at least 18 years old and provide a valid date (DD-MM-YYYY)'
    }
  }
});

// Model
const User = mongoose.model('User', userSchema);

module.exports = User;
