(function(){
    //------data----
    let books = [];
    // dom refs
    const form = document.getElementById("mylibraryform");
    const userNameInput = document.getElementById('User-Name');
    const bookNameInput = document.getElementById('Book-Name');
    const radioButtons = document.querySelectorAll(`input[name="check-box"]`);
    const tbody = document.getElementById('table-body');
    const alertContainer = document.getElementById("alertuser");
    const bookContainer = document.getElementById('bookCounter');
    const searchInput = document.getElementById('searchInput');
    const searchBtn = document.getElementById('searchBtn');

    //helpers
    function getSelectedGenre(){
        for( let rb of radioButtons){
            if(rb.checked) return rb.value;
        }
        return 'Fiction';
    }

    function formatDate(d){
        const dateObj = new Date(d);
        return dateObj.toLocaleDateString('en-IN',{day: '2-digit', month: 'short', year: 'numeric'});
    }

    function showAlert(message, isError = false){
        alertContainer.innerHTML =`
        <div class="alert-custom ${isError ? 'alert-danger-custom' : ''}">
        <i class = "${isError ? 'fas fa-exclamation-circle' : 'fas fa-check-circle'}"></i>
        <span>${message}</span> 
        </div>`;
        setTimeout(()=>{
            alertContainer.innerHTML = '';
        },3200);
    }

        //RENDERTABLE
        function renderTable(filter=''){
    
            const filterLower = filter.toLowerCase().trim();
           let filteredBooks = books;
            if(filterLower !==''){
                filteredBooks = books.filter(book=>
                    book.reader.toLowerCase().includes(filterLower) ||
                    book.bookName.toLowerCase().includes(filterLower) ||
                    book.genre.toLowerCase().includes(filterLower)
                );
            }
            if(filteredBooks.length == 0){
                tbody.innerHTML = `
                <tr class="empty-row">
                <td colspan="6">
                <i class="fas fa-book-open"></i>
                ${filterLower?'No results Found' : 'Library is empty. Add Your First Book!'}
                </td>
                </tr>
                `;
            }else{
                tbody.innerHTML = filteredBooks.map((book,idx)=>{
                    const globalIdx = books.indexOf(book);
                    const isIssued = book.issued || false;
                    return`
                    <tr>
                    <td><strong>${idx+1}</strong></td>
                    <td>${formatDate(book.date)}</td>
                    <td><i class="fas fa-user-circle" style="margin-right: 6px; color: #6c7e94;"></i>${book.reader}</td>
                    <td><i class="fas fa-book" style="margin-right: 8px; color: #b68b5c;"></i>${book.bookName}</td>

                    <td>
                        <span class="book-genre">${book.genre}</span>
                    </td>

                    <td style="text-align: right;">
                    <div class="action-btns" style="justify-content: flex-end;">
                    <button class="btn-icon issue ${isIssued ? 'issued' : ''}" data-id="${globalIdx}" title="${isIssued ? 'already issued' : 'issue book'}">
                    <i class="fas fa-${isIssued ? 'check-circle' : 'hand-holding'}"></i>${isIssued ? 'Issued' : 'Issue'}
                    </button>
                    <button class="btn-icon delete" data-id="${globalIdx}" title="Delete book">
                    <i class="fas fa-trash-alt"></i>Delete
                    </button>
                    </div>
                    </td>
                    </tr>
                    `;
                }).join('');
            }

            //update counter
            bookContainer.textContent = books.length;
        }
        //add Book
        function addBook(reader, bookName, genre){
            const newBook = {
                id:Date.now()+ Math.random(),
                reader:reader.trim(),
                bookName:bookName.trim(),
                genre:genre,
                date: new Date().toISOString(),
                issued:false,
            };
            books.push(newBook);
            renderTable(searchInput.value.trim());
            showAlert(`📚${newBook.bookName} Book is Added Successfully!`);

        }

        //Delete book
        function deleteBook(index){
            if(index>= 0 && index < books.length){
                const removed = books[index];
                books.splice(index,1);
                renderTable(searchInput.value.trim());
                showAlert(`${removed.bookName} book is removed.`)
            }else{
                showAlert(`Book not found.`,true);
            }
        }
        //issue book(toggle issue status)
        function issueBook(index){
            if(index>= 0 && index < books.length){
                const book = books[index];
                book.issued = !book.issued;
                renderTable(searchInput.value.trim());
                const status = book.issued ? 'issued' : 'returned';
                showAlert(`📖${book.bookName} ${status}.`);
            }else{
                showAlert(`Book not Found.`,true);
            }
        }
        //event delegation for action
        function handleTableActions(e){
            const target = e.target.closest('button');
            if(!target) return;
            const idAttr = target.dataset.id;
            if(idAttr === undefined) return;
            const index = parseInt(idAttr,10);
            if(isNaN(index)) return;

            if(target.classList.contains('delete')){
                deleteBook(index);
            }else if(target.classList.contains('issue')){
                issueBook(index);
                
            }
        }

        //form submit
        function handleFormSubmit(e){
            e.preventDefault();
            const reader = userNameInput.value.trim();
            const bookName = bookNameInput.value.trim();
            if(!reader || !bookName){
                showAlert('⚠️ Please fill in both Reader and Book name.',true);
                return;
            }
            const genre = getSelectedGenre();
            addBook(reader,bookName,genre);
            //reset form
            userNameInput.value = '';
            bookNameInput.value = '';
            //reset radio to fiction
            document.querySelector('input[name="check-box"][value="Fiction"]').checked=true;
            userNameInput.focus();
        }
        //search
        function performSearch(){
            const query = searchInput.value.trim();
            renderTable(query); 
        }

        //------- init sample books -------
        function initSample(){
            const samples = [
                {reader:'Eleanor', bookName:'The silient patient', genre:'Fiction'},
                {reader:'Marcus', bookName:'Clean Code', genre:'Programming'},
                {reader:'Sophia', bookName:'Salt,Fat,Acid,Heat', genre:'Cooking'}   
            ];
            samples.forEach(s=>{
                books.push({
                    id: Date.now() + Math.random() * 1000,
                    reader:s.reader,
                    bookName:s.bookName,
                    genre:s.genre,
                    date: new Date(Date.now() - Math.floor(Math.random()*7*24*60*60*1000)).toISOString(),
                    issued:false,
                });
            });
            renderTable('');
        }

        //---- Attach events -----
        form.addEventListener(`submit`,handleFormSubmit);
        tbody.addEventListener(`click`,handleTableActions);

        searchBtn.addEventListener(`click`,performSearch);
        searchInput.addEventListener(`keyup`,(e)=>{
            if(e.key === 'Enter'){
                performSearch();
            }
        });
        //RealTime search while typing
        searchInput.addEventListener(`input`,(e)=>{
            //if you wantclive search,
            //performSearch();
        });
        //start
        initSample();

        //Extra: reset alert on any new action
        //but we handle inside showAlert
    })();