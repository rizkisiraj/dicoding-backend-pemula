const { nanoid } = require("nanoid");
const books = require("./books");

const addBookHandler = (request, h) => {
    const { name, year, author, summary, publisher, pageCount, readPage, reading } = request.payload;
    
    const id = nanoid(16)
    const insertedAt = new Date().toISOString();
    const updatedAt = insertedAt;

    try {
      if(!(request.payload.hasOwnProperty('name'))) {
        throw new Error("Gagal menambahkan buku. Mohon isi nama buku")
      }

      const newBook = {
          id,name,year,author,summary,publisher,pageCount,readPage,reading,insertedAt,updatedAt,finished: pageCount == readPage
      }

      books.push(newBook)
      const isSuccess = books.filter((book) => book.id === id).length > 0;

      if (isSuccess) {
          const response = h.response({
            status: 'success',
            message: 'Catatan berhasil ditambahkan',
            data: {
              ...newBook,
            },
          });
          response.code(201);
          return response;
        }
      
        const response = h.response({
          status: 'fail',
          message: 'Buku gagal ditambahkan',
        });
        response.code(500);
        return response;

    } catch(e) {
      const response = h.response({
        status: 'fail',
        message: e.message,
      });
      response.code(400);
      return response;
    }
}

const showBookHandler = (_, h) => {
    const response = h.response({
        status: 'success',
        data: {
          books: books.map(book => {
            return {
              id: book.id,
              name: book.name,
              publisher: book.publisher
            }
          })
        },
      });
      response.code(200);
      return response;
}

const getBookByIdHandler = (request, h) => {
  const { bookId } = request.params;

  const book = books.filter(b => b.id == bookId)[0]

  if(book !== undefined) {
    const response = h.response({
      status: 'success',
      data: {
        book
      },
    });
    response.code(200);
    return response;
  }

  return h.response({
    status: "fail",
    message: "Buku tidak ditemukan"
  }).code(404)
}

const editBookHandler = (request, h) => {
  const { name, year, author, summary, publisher, pageCount, readPage, reading } = request.payload;
  
  const { bookId } = request.params
  const bookIndex = books.findIndex(book => book.id == bookId)
  
  if(bookIndex === -1) {
    return h.response({
      status: "fail",
      message: "Buku tidak ditemukan"
    }).code(404)
  }

  if(!(request.payload.hasOwnProperty('name'))) {
    return h.response({
      status: "fail",
      message: "Gagal memperbarui buku. Mohon isi nama buku"
    }).code(400)
  }

  if(readPage > pageCount) {
    return h.response({
      status: "fail",
      message: "Gagal memperbarui buku. readPage tidak boleh lebih besar dari pageCount"
    }).code(400)
  }

    const newBook = {
        id: bookId,name,year,author,summary,publisher,pageCount,readPage,reading,insertedAt: books[bookIndex].insertedAt,updatedAt: new Date().toISOString(),finished: pageCount == readPage
    }
    books[bookIndex] = newBook

    const response = h.response({
      status: 'success',
      message: 'Buku berhasil diperbaharui',
    });
    response.code(200);
    return response;
}

const deleteBookByIdHandler = (request, h) => {
  const { bookId } = request.params;

  const bookIndex = books.findIndex(b => b.id == bookId)
  books.splice(bookIndex, 1)

  if(bookIndex !== undefined) {
    const response = h.response({
      status: 'success',
      message: "Buku berhasil dihapus",
    });
    response.code(200);
    return response;
  }

  return h.response({
    status: "fail",
    message: "Buku gagal dihapus. Id tidak ditemukan"
  }).code(404)
}

module.exports = { addBookHandler, showBookHandler, getBookByIdHandler, editBookHandler, deleteBookByIdHandler }