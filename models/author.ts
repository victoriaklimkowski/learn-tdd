import mongoose, { Schema, Document, Model } from 'mongoose';

// Define an interface for the Author document
export interface IAuthor extends Document {
  first_name: string;
  family_name: string;
  date_of_birth?: Date;
  date_of_death?: Date;
  name: string;
  lifespan: string;
}

var AuthorSchema: Schema<IAuthor> = new Schema(
  {
    first_name: {type: String, required: true, maxLength: 100},
    family_name: {type: String, required: true, maxLength: 100},
    date_of_birth: {type: Date},
    date_of_death: {type: Date},
  }
);

// Virtual for author's full name
AuthorSchema
.virtual('name')
.get(function () {
// To avoid errors in cases where an author does not have either a family name or first name
// We want to make sure we handle the exception by returning an empty string for that case
  let fullname = '';
  if (this.first_name && this.family_name) {
    fullname = this.family_name + ', ' + this.first_name
  }
  if (!this.first_name || !this.family_name) {
    fullname = '';
  }
  return fullname;
});

// Virtual for author's lifespan
AuthorSchema.virtual('lifespan').get(function() {
  var lifetime_string = '';
  // IF we added an else branch, we wouldn't have 100% branch coverage here
  // Because we don't have tests for an else branch
  if (this.date_of_birth) {
    lifetime_string = this.date_of_birth.getFullYear().toString();
  } else {
    lifetime_string = '';
  }
  lifetime_string += ' - ';
  if (this.date_of_death) {
    lifetime_string += this.date_of_death.getFullYear().toString();
  } else {
    lifetime_string += 'present';
  }
  return lifetime_string;
});

// Export the model
const Author: Model<IAuthor> = mongoose.model<IAuthor>('Author', AuthorSchema);
export default Author;
