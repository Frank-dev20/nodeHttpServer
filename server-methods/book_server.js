const http = require("http");

const fs = require("fs");
const path = require("path");

const pathToBookDB = path.join(__dirname, "db", "books.json");
console.log(pathToBookDB);

const PORT = 4000;
const HOST_NAME = "localhost";

function requestHandler(req, res){
    if(req.url === "/books" && req.method === "GET"){
        // return all books
        getAllBooks(req, res)
    }else if (req.url === "/books" && req.method === "POST"){
        // adda book
       addBook(req, res)
    } else if (req.url === "/books" && req.method === "UPDATE"){
        updateBook(req, res)
    } else if(req.url === "/books" && req.method === "DELETE"){
        deleteBook(req, res)
    }
        
}

function getAllBooks(req, res){
    fs.readFile(pathToBookDB, "utf8", (err, books)=>{
        if(err){
            console.log(err)
            res.writeHead(400)
            res.end("An error has occurred")
        }
        res.end(books)
    })
}

function addBook(req, res){
    const body = [];
    req.on("data", (chunk)=>{
        body.push(chunk)
    })
    req.on("end", ()=>{
        const convertedBookToString = Buffer.concat(body).toString();
        const convertedBookIntoJson = JSON.parse(convertedBookToString);
        //add the new book to array of books.json
        
        fs.readFile(pathToBookDB, "utf8", (err, books)=>{
            if(err){
                console.log(err)
                res.writeHead(400)
                res.end("Error occurred")
            }
            const oldBooks = JSON.parse(books)
            const allBooks = [...oldBooks, convertedBookIntoJson]

            fs.writeFile(pathToBookDB, JSON.stringify(allBooks), (err)=>{
                if(err){
                    console.log(err)
                    res.writeHead(500)
                    res.end(JSON.stringify({
                        message: "Inter server error occurred"
                    }))
                }
                res.end(JSON.stringify(convertedBookIntoJson))
            })
        })
    })
}

function updateBook(req, res){
    const body = [];

    req.on("data", (chunk)=>{
        body.push(chunk)
    })

    req.on("end", ()=>{
        const parsedBook = Buffer.concat(body).toString();
        const detailsToUpdate = JSON.parse(parsedBook);
        const bookId = detailsToUpdate.id;

        fs.readFile(pathToBookDB, "utf8", (err, books)=>{
            if(err){
                console.log(err)
                res.writeHead(400)
                res.end("Error occurred")
            }

            const booksObj = JSON.parse(books)

            const bookIndex = booksObj.findIndex(book => book.id === bookId)
            if(bookIndex === -1){
                res.writeHead(400)
                res.end("Book with this id does not existed")
                return
            }

            const updatedBook = {...booksObj[bookIndex], ...detailsToUpdate} 
            booksObj[bookIndex] = updatedBook

            fs.writeFile(pathToBookDB, JSON.stringify(booksObj), (err)=>{
                if(err){
                    console.log(err)
                    res.writeHead(500)
                    res.end(JSON.stringify({
                        message: "Internal server error occurred"
                    }))
                }
                res.writeHead(200)
                res.end("update was successful")
            })
        })
    })
}


function deleteBook(req, res){
    const body = []

    req.on("data", (chunk)=>{
        body.push(chunk)
    })

    req.on("end", ()=>{
        const parsedBook = Buffer.concat(body).toString();
        const detailsToDelete = JSON.parsed(parsedBook)
        const bookId = detailsToDelete.id;

        fs.readFile(pathToBookDB, "utf8", (err, books)=>{
            if(err){
                console.log(err)
                res.writeHead(400)
                res.end("An error occurred")
            }
            const booksObj = JSON.parse(books)
            const bookIndex = booksObj.findIndex(book => book.id === bookId)

            if (bookIndex === -1) {
                res.writeHead(404)
                res.end("Book with the specified id not found!")
                return
            }

            // delete book operation

            booksObj.splice(bookIndex, 1)
            fs.writeFile(booksDbPath, JSON.stringify(booksObj), (err) => {
                if (err) {
                    console.log(err);
                    res.writeHead(500);
                    res.end(JSON.stringify({
                        message: 'Internal Server Error. Could not save book to database.'
                    }));
                }

                res.writeHead(200)
                res.end("Deletion successfull!");
            });
        })
    })
}
const server = http.createServer(requestHandler);

server.listen(PORT, HOST_NAME, ()=>{
    console.log(`Server is running successfully at ${HOST_NAME}:${PORT}`)
})