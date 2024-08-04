import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import * as bcrypt from 'bcrypt';
import { Document } from 'mongoose';

/**
 * User schema definition.
 * Includes basic user information with hashed password.
 */
@Schema({
  timestamps: true,
})
export class User extends Document {
  @Prop({ required: true })
  name: string; // User's full name

  @Prop({ required: true, trim: true, unique: true })
  email: string; // User's email address, must be unique

  @Prop({ required: true })
  password: string; // User's password, to be hashed before saving

  @Prop({ required: true, unique: true })
  mobile: number; // User's mobile number, must be unique
}

// Create schema instance for User class
export const UserSchema = SchemaFactory.createForClass(User);

/**
 * Pre-save hook to hash the user's password before saving to the database.
 */
UserSchema.pre<User>('save', async function (next) {
  // If the password is not modified, skip hashing
  if (!this.isModified('password')) {
    return next();
  }

  // Generate salt and hash the password
  const salt = await bcrypt.genSalt(10);
  const hashPassword = await bcrypt.hash(this.password, salt);
  this.password = hashPassword;
  next();
});
