const books = [];
const RENDER_EVENT = 'render-book';
const SAVED_EVENT = 'saved-book';
const STORAGE_KEY = 'BOOKSHELF_APPS';
const inputHeader = document.getElementById('inputHeader')
const bookTitle = document.getElementById('inputBookTitle');
const bookAuthor = document.getElementById('inputBookAuthor');
const bookYear = document.getElementById('inputBookYear');
const bookIsComplete = document.getElementById('inputBookIsComplete');
const submitForm = document.getElementById('inputBook');
const buttonSubmit = document.getElementById('bookSubmit');
const searchForm = document.getElementById('searchBook');
const searchTitle = document.getElementById('searchBookTitle')
const clearSearch = document.getElementById('clearSearch')
const resetFilter = document.getElementById('resetFilter')
const uncompletedBookList = document.getElementById('incompleteBookshelfList');
const completedBookList = document.getElementById('completeBookshelfList');
let bookSearch = [];
let isEdit = false;
let isSearch = false;
let idTemp = '';

document.addEventListener('DOMContentLoaded', function () {
  submitForm.addEventListener('submit', function (event) {
    event.preventDefault();
    addBook();
  });

  searchForm.addEventListener('submit', function (event) {
    event.preventDefault();
    searchBook();
  });

  if (isStorageExist()) {
    loadDataFromStorage();
  }
});

function isStorageExist() /* boolean */ {
  if (typeof (Storage) === undefined) {
    alert('Browser kamu tidak mendukung local storage');
    return false;
  }
  return true;
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

bookIsComplete.addEventListener('click', function (event) {
  if (bookIsComplete.checked) {
    buttonSubmit.innerHTML = 'Masukkan Buku ke rak <span>Sudah selesai dibaca</span>';
  } else {
    buttonSubmit.innerHTML = 'Masukkan Buku ke rak <span>Belum selesai dibaca</span>';
  }
});

clearSearch.addEventListener('click', function(event){
  searchTitle.value = '';
  isSearch = false;
});

resetFilter.addEventListener('click', function(event){
  clearSearch.click();
  document.dispatchEvent(new Event(RENDER_EVENT));
});

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

function addBook () {
  const generatedID = generateId();
  const bookObject = generateBookObject (generatedID, bookTitle.value, bookAuthor.value, bookYear.value, bookIsComplete.checked);
  if (!isEdit) {
    books.push(bookObject);
  } else {
    bookObject.id = idTemp;
    books[findBookIndex (bookObject.id)] = bookObject;
  }
  
  document.dispatchEvent (new Event (RENDER_EVENT));
  saveData();
  clearInput();

  if (!isEdit) {
    alert('Buku baru berhasil disimpan');
  } else {
    alert('Perubahan berhasil disimpan');
    idTemp = '';
    isEdit = false;
    inputHeader.innerText = 'Masukkan Buku Baru';
  }
}

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
    inputHeader.innerText = 'Edit Data Buku';
    bookTitle.value = bookObject.title;
    bookAuthor.value = bookObject.author;
    bookYear.value = bookObject.year;
    bookIsComplete.checked = !bookObject.isComplete;
    bookIsComplete.click();
    bookTitle.focus();
  });
  
  const completedButton = document.createElement('button');
    
  if (!bookObject.isComplete) {
    completedButton.addEventListener('click', function(event) {
      addBookToCompleted(bookObject.id);
    });
    completedButton.classList.add('green');
    completedButton.innerText = 'Selesai Dibaca';
  } else {
    completedButton.addEventListener('click', function(event) {
      undoBookFromCompleted(bookObject.id);
    });
    completedButton.classList.add('blue');
    completedButton.innerText = 'Belum Dibaca';
  }
  
  const buttonContainer = document.createElement('div');
  buttonContainer.classList.add('action');
  buttonContainer.append(completedButton, editButton, removeButton);
  
  container.append(buttonContainer);
  
  return container;
}

function searchBook() {
  if (!searchTitle.value) {
    return document.dispatchEvent(new Event(RENDER_EVENT));
  }

  isSearch = true;
  let judulCari = searchTitle.value.toLowerCase();
  bookSearch = [];

  books.forEach((book) => {
    if (book.title.toLowerCase().includes(judulCari)){
      bookSearch.push(book);
    }
  });

  document.dispatchEvent (new Event (RENDER_EVENT));
  isSearch = false;
}

function findBook (bookId) {
  for (const bookItem of books) {
    if (bookItem.id === bookId) {
      return bookItem;
    }
  }
  return null;
}

function findBookIndex (bookId) {
  for (const index in books) {
    if (books[index].id === bookId) {
      return index;
    }
  }
  return -1;
}

function removeBook (bookId) {
  const isConfirmed = confirm('Yakin hapus buku ini?');
  if (!isConfirmed) return

  const bookTarget = findBookIndex (bookId);
  
  if (bookTarget === -1) return;

  books.splice(bookTarget, 1);
  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();

  alert('Buku berhasil dihapus!')
}

function saveData() {
  if (isStorageExist()) {
    const parsed = JSON.stringify(books);
    localStorage.setItem(STORAGE_KEY, parsed);
    document.dispatchEvent(new Event(SAVED_EVENT));
  }
}

function addBookToCompleted (bookId) {
  const bookTarget = findBook (bookId);
  
  if (bookTarget == null) return;
  
  bookTarget.isComplete = true;
  document.dispatchEvent (new Event(RENDER_EVENT));
  saveData();
}

function undoBookFromCompleted (bookId) {
  const bookTarget = findBook (bookId);
  
  if (bookTarget == null) return;
  
  bookTarget.isComplete = false;
  document.dispatchEvent (new Event(RENDER_EVENT));
  saveData();
}

function clearInput () {
  bookTitle.value = '';
  bookAuthor.value = '';
  bookYear.value = '';
  bookIsComplete.checked = true;
  bookIsComplete.click();
}

document.addEventListener (RENDER_EVENT, function () {
  uncompletedBookList.innerHTML = '';
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

document.addEventListener(SAVED_EVENT, function () {
  console.log(localStorage.getItem(STORAGE_KEY));
});
