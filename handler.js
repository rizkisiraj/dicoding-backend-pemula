const { nanoid } = require("nanoid");
const books = require("./books");

const addBookHandler = (request, h) => {
    const { name, year, author, summary, publisher, pageCount, readPage, reading } = request.payload;
    
    const id = nanoid(16)
    const insertedAt = new Date().toISOString();
    const updatedAt = insertedAt;

    try {
      if(!(Object.prototype.hasOwnProperty.call(request.payload, "name"))) {
        throw new Error("Gagal menambahkan buku. Mohon isi nama buku")
      }

      if(pageCount < readPage) {
        throw new Error("Gagal menambahkan buku. readPage tidak boleh lebih besar dari pageCount")
      }

      const newBook = {
          bookId: id,name,year,author,summary,publisher,pageCount,readPage,reading,insertedAt,updatedAt,finished: pageCount === readPage
      }

      books.push(newBook)
      const isSuccess = books.filter((book) => book.bookId === id).length > 0;

      if (isSuccess) {
          const response = h.response({
            status: 'success',
            message: 'Buku berhasil ditambahkan',
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

const showBookHandler = (request, h) => {
    let booksToSend = books;

    const { name, reading, finished } = request.query

    if(name) {
      booksToSend = booksToSend.filter(b => b.name.toLowerCase().includes(name.toLowerCase()))
    }

    if((reading !== null || reading !== undefined) && booksToSend.length > 0) {
      if(reading === "1") {
        booksToSend = booksToSend.filter(b => b.reading === true);
      } else if(reading === "0") {
        booksToSend = booksToSend.filter(b => b.reading === false);
      }
    }

    if((finished !== null || finished !== undefined) && booksToSend.length > 0) {
      if(finished === "1") {
        booksToSend = booksToSend.filter(b => b.finished === true);
      } else if(finished === "0") {
        booksToSend = booksToSend.filter(b => b.finished === false);
      }
    }

    const response = h.response({
        status: 'success',
        data: {
          books: booksToSend.map(b => {
            return {
              id: b.bookId,
              name: b.name,
              publisher: b.publisher,
            }
          })
        },
      });
      response.code(200);
      return response;
}

const getBookByIdHandler = (request, h) => {
  const { bookId } = request.params;

  const book = books.filter(b => b.bookId == bookId)[0]

  if(book !== undefined) {
    const response = h.response({
      status: 'success',
      data: {
        book: {
          id: book.bookId,
          ...book
        }
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
  const bookIndex = books.findIndex(book => book.bookId == bookId)
  
  if(bookIndex === -1) {
    return h.response({
      status: "fail",
      message: "Gagal memperbarui buku. Id tidak ditemukan"
    }).code(404)
  }

  if(!(Object.prototype.hasOwnProperty.call(request.payload, "name"))) {
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
        bookId,name,year,author,summary,publisher,pageCount,readPage,reading,insertedAt: books[bookIndex].insertedAt,updatedAt: new Date().toISOString(),finished: pageCount == readPage
    }
    books[bookIndex] = newBook

    const response = h.response({
      status: 'success',
      message: 'Buku berhasil diperbarui',
    });
    response.code(200);
    return response;
}

const deleteBookByIdHandler = (request, h) => {
  const { bookId } = request.params;

  const bookIndex = books.findIndex(b => b.bookId == bookId)
  books.splice(bookIndex, 1)

  if(bookIndex >= 0) {
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