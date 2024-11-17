import { Response } from 'express';
import Book from '../models/book'; // Adjust the import to your Book model path
import BookInstance from '../models/bookinstance'; // Adjust the import to your BookInstance model path
import { showBookDtls } from '../pages/book_details'; // Adjust the import to where showBookDtls is defined

describe('showBookDtls', () => {
    let res: Partial<Response>;
    const mockBook = {
        title: 'Mock Book Title',
        author: { name: 'Mock Author' }
    };
    const mockCopies = [
        { imprint: 'First Edition', status: 'Available' },
        { imprint: 'Second Edition', status: 'Checked Out' }
    ];

    beforeEach(() => {
        // Before each test create a mock response 
        res = {
            status: jest.fn().mockReturnThis(), // Chaining for status
            send: jest.fn()
        };
    });

    afterEach(() => {
        jest.clearAllMocks(); // Clear mocks after each test
    });

    it('should return book details when the book and copies exist', async () => {
        // Mocking the Book model's findOne and populate methods
        // We are returning a stub which returns a hard coded value (book)
        // which in this case is an object - same as beofre with author & sort
        // except this time we are using populate for the whole object's values
        // The whole thing is a chain of functions & should always return mockBook
        const mockFindOne = jest.fn().mockReturnValue({
            populate: jest.fn().mockReturnThis(), // Allows method chaining
            exec: jest.fn().mockResolvedValue(mockBook) // Resolves to your mock book
        });
        // WE know that findOne will return a populate to get the author information
        // and execute the query to return a promise (35:47)
        // Every time we see a Book.findOne, replace it with mockFindOne
        Book.findOne = mockFindOne;

        // Same as above
        // but select imprint and status - which comes from the requirements
        // Mocking the BookInstance model's find and select methods
        const mockFind = jest.fn().mockReturnValue({
            select: jest.fn().mockReturnThis(), // Select is called here
            exec: jest.fn().mockResolvedValue(mockCopies)
        });
        // Same type of mock
        BookInstance.find = mockFind;

        // Act
        await showBookDtls(res as Response, '12345');

        // Assert
        // Using spies to check if the correct methods were called  with the correct arguments
        expect(mockFindOne).toHaveBeenCalledWith({ _id: '12345' });
        expect(mockFindOne().populate).toHaveBeenCalledWith('author');
        expect(mockFind).toHaveBeenCalledWith({ book: '12345' });
        expect(mockFind().select).toHaveBeenCalledWith('imprint status');

        // Using spies to check if the response was sent with the correct data
        // Now - is my implementation actually sending all these objects from these?
        // Still have to write an E2E test to ensure the response was obtained as well
        expect(res.send).toHaveBeenCalledWith({
            title: mockBook.title,
            author: mockBook.author.name,
            copies: mockCopies
        });
    });

    it('should return 404 if the book instance is null', async () => {
        const id = '12345';
        // Mocking the Book model's findOne method to throw an error
        BookInstance.find = jest.fn().mockReturnValue({
            select: jest.fn().mockReturnThis(), // Select is called here
            exec: jest.fn().mockResolvedValue(null)
        });

        // Don't have to mock anything else because call should end with the 404 message

        // Act
        await showBookDtls(res as Response, id);

        // Assert
        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.send).toHaveBeenCalledWith(`Book details not found for book ${id}`);
    });

    it('should return 404 for non string book id', async () => {
        const id = { id: '12345' };

        // Act
        await showBookDtls(res as Response, id as unknown as string);

        // Assert
        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.send).toHaveBeenCalledWith(`Book ${id} not found`);
    });

    it('should return 500 if there is an error fetching the book', async () => {
        // Mocking the Book model's findOne method to throw an error
        Book.findOne = jest.fn().mockImplementation(() => {
            throw new Error('Database error');
        });

        // Act
        await showBookDtls(res as Response, '12345');

        // Assert
        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.send).toHaveBeenCalledWith('Error fetching book 12345');
    });

    it('should return 500 if there is an error fetching book instance', async () => {
        // Mocking the Book model's findOne method to throw an error
        BookInstance.find = jest.fn().mockImplementation(() => {
            throw new Error('Database error');
        });

        // Act
        await showBookDtls(res as Response, '12345');

        // Assert
        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.send).toHaveBeenCalledWith('Error fetching book 12345');
    });
});
