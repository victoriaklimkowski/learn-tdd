import { Request, Response } from 'express';
import Author, { IAuthor } from '../models/author';

// Function to get the list of authors
export const getAuthorList = async (): Promise<string[]> => {
  try {
    const authorsList: IAuthor[] = await Author.find()
      .sort([['family_name', 'ascending']]);
    return authorsList.map(author => `${new Author(author).name} : ${new Author(author).lifespan}`);
  } catch (error) {
    console.error('Error fetching authors:', error);
    return [];
  }
};

// Function to handle the request and respond with author list
export const showAllAuthors = async (res: Response): Promise<void> => {
  try {
    const data: string[] = await getAuthorList();
    if (data.length > 0) {
      res.send(data);
    } else {
      res.send('No authors found');
    }
  } catch (error) {
    console.error('Error processing request:', error);
    res.send('No authors found');
  }
};

