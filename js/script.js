const books = [];
const RENDER_EVENT = 'render-book';
const SAVED_EVENT = 'saved-book';
const STORAGE_KEY = 'BOOKSHELF_APPS';
let bookSearch = [];
let isEdit = false;
let isSearch = false;
let idTemp = '';

function isStorageExist() /* boolean */ {
  if (typeof (Storage) === undefined) {
    alert('Browser kamu tidak mendukung local storage');
    return false;
  }
  return true;
}

const checkComplete = document.getElementById('inputBookIsComplete');
checkComplete.addEventListener('click', function (event) {
  const buttonSubmit = document.getElementById('bookSubmit');
  if (checkComplete.checked) {
    buttonSubmit.innerHTML = 'Masukkan Buku ke rak <span>Sudah selesai dibaca</span>';
  } else {
    buttonSubmit.innerHTML = 'Masukkan Buku ke rak <span>Belum selesai dibaca</span>';
  }
});

document.addEventListener('DOMContentLoaded', function () {
  const submitForm = document.getElementById('inputBook');
  submitForm.addEventListener('submit', function (event) {
    event.preventDefault();
    addBook();
  });
  const searchForm = document.getElementById('searchBook');
  searchForm.addEventListener('submit', function (event) {
    event.preventDefault();
    searchBook();
  });
  if (isStorageExist()) {
    loadDataFromStorage();
  }
});

document.addEventListener(SAVED_EVENT, function () {
  console.log(localStorage.getItem(STORAGE_KEY));
});

function addBook () {
  const bookTitle = document.getElementById('inputBookTitle').value;
  const bookAuthor = document.getElementById('inputBookAuthor').value;
  const bookYear = document.getElementById('inputBookYear').value;
  const bookIsComplete = document.getElementById('inputBookIsComplete').checked;
  
  const generatedID = generateId();
  const bookObject = generateBookObject (generatedID, bookTitle, bookAuthor, bookYear, bookIsComplete);
  if (!isEdit) {
    books.push(bookObject);
  } else {
    bookObject.id = idTemp;
    books[findBookIndex (bookObject.id)] = bookObject;
    idTemp = '';
    isEdit = false;
    document.getElementById('inputHeader').innerText = 'Masukkan Buku Baru';
  }
  
  document.dispatchEvent (new Event (RENDER_EVENT));
  saveData();
}

function searchBook() {
  isSearch = true;
  bookSearch = [];
	const searchTitle = document.getElementById('searchBookTitle').value;
  for (const searchItem of books) {
    let judulCari = searchItem.title;
    if (judulCari == searchTitle) {
			bookSearch.push(searchItem);
		}
	}
	console.log(bookSearch)
  document.dispatchEvent (new Event (RENDER_EVENT));
  isSearch = false;
}

function saveData() {
  if (isStorageExist()) {
    const parsed = JSON.stringify(books);
    localStorage.setItem(STORAGE_KEY, parsed);
    document.dispatchEvent(new Event(SAVED_EVENT));
  }
}

function generateId () {
  return +new Date();
}

function generateBookObject (id, title, author, year, isComplete) {
  return {
    id,
    title,
    author,
    year,
    isComplete
  };
}

document.addEventListener (RENDER_EVENT, function () {
  const uncompletedBookList = document.getElementById('incompleteBookshelfList');
  uncompletedBookList.innerHTML = '';
  
  const completedBookList = document.getElementById('completeBookshelfList');
  completedBookList.innerHTML = '';
  
  if (!isSearch) {
    for (bookItem of books) {
      const bookElement = setBook (bookItem);
      if (!bookItem.isComplete) {
        uncompletedBookList.append (bookElement);
      } else {
        completedBookList.append (bookElement);
      }
    }
  } else {
    for (bookItem of bookSearch) {
      const bookElement = setBook (bookItem);
      if (!bookItem.isComplete) {
        uncompletedBookList.append (bookElement);
      } else {
        completedBookList.append (bookElement);
      }
    }
  }
});

function setBook (bookObject) {
  const textTitle = document.createElement('h3');
  textTitle.innerText = bookObject.title;
  
  const textAuthor = document.createElement('p');
  textAuthor.innerText = bookObject.author;
  
  const textYear = document.createElement('p');
  textYear.innerText = bookObject.year;
  
  const container = document.createElement('article');
  container.classList.add('book_item');
  container.append(textTitle, textAuthor, textYear);
  container.setAttribute('id', 'book-${bookObject.id}');
  
  const removeButton = document.createElement('button');
  removeButton.classList.add('red');
  removeButton.innerText ='Hapus buku';
  removeButton.addEventListener('click', function(event) {
    removeBook(bookObject.id);
  });
  
  const editButton = document.createElement('button');
  editButton.classList.add('darkorange');
  editButton.innerText ='Edit buku';
  editButton.addEventListener('click', function(event) {
    isEdit = true;
    idTemp = bookObject.id;
    document.getElementById('inputHeader').innerText = 'Edit Data Buku';
    document.getElementById('inputBookTitle').value = bookObject.title;
    document.getElementById('inputBookAuthor').value = bookObject.author;
    document.getElementById('inputBookYear').value = bookObject.year;
    document.getElementById('inputBookIsComplete').checked = bookObject.isComplete;
    document.getElementById('inputBookTitle').autofocus;
  });
  
  const completedButton = document.createElement('button');
  completedButton.classList.add('green');
  
  if (!bookObject.isComplete) {
    completedButton.addEventListener('click', function(event) {
      addBookToCompleted(bookObject.id);
    });
    completedButton.innerText = 'Selesai Dibaca';
  } else {
    completedButton.addEventListener('click', function(event) {
      undoBookFromCompleted(bookObject.id);
    });
    completedButton.innerText = 'Belum Dibaca';
  }
  
  const buttonContainer = document.createElement('div');
  buttonContainer.classList.add('action');
  buttonContainer.append(completedButton, editButton, removeButton);
  
  container.append(buttonContainer);
  
  return container;
}

function addBookToCompleted (bookId) {
  const bookTarget = findBook (bookId);
  
  if (bookTarget == null) return;
  
  bookTarget.isComplete = true;
  document.dispatchEvent (new Event(RENDER_EVENT));
  saveData();
}

function findBook (bookId) {
  for (const bookItem of books) {
    if (bookItem.id === bookId) {
      return bookItem;
    }
  }
  return null;
}

function removeBook (bookId) {
  const bookTarget = findBookIndex (bookId);
  
  if (bookTarget === -1) return;

  books.splice(bookTarget, 1);
  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
}

function undoBookFromCompleted (bookId) {
  const bookTarget = findBook (bookId);
  
  if (bookTarget == null) return;
  
  bookTarget.isComplete = false;
  document.dispatchEvent (new Event(RENDER_EVENT));
  saveData();
}

function findBookIndex (bookId) {
  for (const index in books) {
    if (books[index].id === bookId) {
      return index;
    }
  }
  return -1;
}

function loadDataFromStorage() {
  const serializedData = localStorage.getItem(STORAGE_KEY);
  let data = JSON.parse(serializedData);
 
  if (data !== null) {
    for (const book of data) {
      books.push(book);
    }
  }
 
  document.dispatchEvent(new Event(RENDER_EVENT));
}