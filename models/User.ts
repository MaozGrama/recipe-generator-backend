import mongoose, { Schema, Document } from "mongoose";

export interface Recipe {
  title: string;
  ingredients: string[];
  instructions: string[];
}

export interface Rating {
  recipeTitle: string;
  rating: number; // 1-5
}

export interface ShoppingItem {
  item: string;
  count: number;
}

export interface User extends Document {
  email: string;
  password: string;
  username: string;
  favorites: Recipe[];
  ratings: Rating[];
  shoppingList: ShoppingItem[];
}

const UserSchema: Schema = new Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  username: { type: String, required: true, unique: true },
  favorites: [
    {
      title: { type: String, required: true },
      ingredients: [{ type: String, required: true }],
      instructions: [{ type: String, required: true }],
    },
  ],
  ratings: [
    {
      recipeTitle: { type: String, required: true },
      rating: { type: Number, required: true, min: 1, max: 5 },
    },
  ],
  shoppingList: [
    {
      item: { type: String, required: true },
      count: { type: Number, required: true, default: 1 },
    },
  ],
});

export default mongoose.model<User>("User", UserSchema);