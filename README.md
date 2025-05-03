# Rhymitty - Помощник для поиска рифм

## О проекте

Rhymitty - это простое веб-приложение, разработанное для помощи поэтам, авторам текстов песен и всем, кто работает с рифмованным или ритмичным текстом. Оно позволяет загрузить текст и быстро найти строки, заканчивающиеся на определенные звуковые или буквенные сочетания, работая по принципу поиска рифм по окончанию строк.

## Возможности

- **Ввод/Редактирование текста:** Удобное поле, куда можно вставить или написать свой текст.
- **Поиск по окончанию строк:** Основная логика поиска сосредоточена на последних словах/слогах строк.
- **Поиск по гласным:** Возможность искать рифмы, совпадающие только по последовательности гласных с конца строки (например, по запросу "оеа" найдет "бел**ого пера**").
- **Поиск по слогам/буквам:** Поиск точного совпадения по последним слогам или буквам строки (например, по запросу "пера" найдет "**пера**").
- **Неточный поиск:** Опция для поиска схожих по звучанию окончаний, учитывая примерные соответствия букв (например, о~ё, а~я, е~э, л~р).
- **Подсветка совпадений:** Найденные окончания строк подсвечиваются непосредственно в текстовом поле.
- **Боковая панель навигации:** Список всех найденных совпадений с возможностью быстрого перехода к нужной строке в тексте.
- **Сохранение текста:** Ваш текст автоматически сохраняется в браузере (с использованием `localStorage`) и восстанавливается при следующем открытии.
- **История изменений:** Возможность отменять (`Undo`) и возвращать (`Redo`) изменения текста.
- **Две темы оформления:** Светлая и темная темы для комфортной работы в любое время суток.
- **Интуитивно понятный дизайн:** Чистый и лаконичный интерфейс.

## Как это работает

Вы вставляете текст в основное поле и вводите искомое окончание (последовательность гласных, слог, слово или его часть) в поле поиска на боковой панели. Выбираете тип поиска (по гласным или слогам) и опционально включаете неточный поиск. При нажатии кнопки "Найти", приложение анализирует каждую строку вашего текста с конца, применяя выбранные правила сравнения. Найденные совпадения подсвечиваются, и их список появляется на боковой панели для удобной навигации.

## Установка и запуск

Rhymitty - это статическое веб-приложение, которое не требует серверной части.

1.  Клонируйте репозиторий или скачайте ZIP-архив с файлами проекта (`index.html`, `style.css`, `script.js`).
2.  Разместите все три файла в одной папке.
3.  Откройте файл `index.html` в любом современном веб-браузере (например, Chrome, Firefox, Safari, Edge).

Приложение сразу же готово к использованию.

## Использование

1.  **Текстовое поле:** Вставьте или наберите свой текст в большом центральном поле.
2.  **Поле поиска:** Введите искомую рифму или окончание в поле "Рифма" на боковой панели.
3.  **Тип поиска:** Выберите "Гласные", если хотите искать совпадения только по последовательности гласных с конца, или "Слоги/Буквы" для поиска совпадения последних символов.
4.  **Неточный поиск:** Отметьте этот чекбокс, если хотите включить поиск схожих по звучанию букв (например, "о" будет считаться похожим на "ё").
5.  **Кнопка "Найти":** Нажмите для запуска поиска и подсветки совпадений.
6.  **Список совпадений:** В разделе "Совпадения" появится список строк, где найдена рифма. Нажмите на элемент списка, чтобы прокрутить к этой строке в тексте.
7.  **История текста:** Используйте кнопки "<" (Отменить) и ">" (Вернуть) для навигации по истории изменений вашего текста.
8.  **Тема:** Кнопка с иконками солнца/луны переключает между светлой и темной темой.

## Планы на будущее

- Учет ударений (требует базы данных ударений и более сложной логики).
- (Ваши идеи?)

## Используемые технологии

- HTML5
- CSS3
- JavaScript (Vanilla JS)
- Font Awesome (для иконок)

# Rhymitty - Your Rhyme Finding Companion

## About The Project

Rhymitty is a simple web application designed to assist poets, lyricists, and anyone working with rhyming or rhythmic text. It allows you to load text and quickly find lines ending in specific sound or letter combinations, acting as a rhyme finder based on line endings.

## Features

- **Text Input/Editing:** A convenient area where you can paste or write your text.
- **End-of-Line Search:** The core search logic focuses on the last words/syllables of lines.
- **Vowel Search:** Option to find rhymes matching only the sequence of vowels from the end of the line (e.g., searching for "оеа" will find "бел**ого пера**").
- **Syllable/Letter Search:** Searches for an exact match of the last syllables or letters of the line (e.g., searching for "пера" will find "**пера**").
- **Fuzzy Search:** An option to find similar-sounding endings, accounting for approximate letter correspondences (e.g., о~ё, а~я, е~э, л~р).
- **Highlighting Matches:** Found line endings are highlighted directly in the text area.
- **Sidebar Navigation:** A list of all found matches with the ability to quickly jump to the corresponding line in the text.
- **Text Persistence:** Your text is automatically saved in the browser (`localStorage`) and restored when you reopen the application.
- **Text History:** Ability to Undo and Redo text changes.
- **Dual Theme:** Light and dark themes for comfortable work at any time of day.
- **Intuitive Design:** Clean and laconic user interface.

## How It Works

You paste your text into the main area and enter the desired ending (a sequence of vowels, a syllable, a word, or part of it) into the search field in the sidebar. You select the search type (Vowels or Syllables/Letters) and optionally enable fuzzy search. Upon clicking the "Search" button, the application analyzes each line of your text from the end, applying the chosen comparison rules. Found matches are highlighted, and a list of them appears in the sidebar for easy navigation.

## Installation and Setup

Rhymitty is a static web application and does not require a server-side component.

1.  Clone the repository or download the ZIP archive containing the project files (`index.html`, `style.css`, `script.js`).
2.  Place all three files in the same folder.
3.  Open the `index.html` file in any modern web browser (e.g., Chrome, Firefox, Safari, Edge).

The application is ready to use immediately.

## Usage

1.  **Text Area:** Paste or type your text into the large central field.
2.  **Search Field:** Enter the rhyme or ending you are looking for in the "Rhyme" field in the sidebar.
3.  **Search Type:** Select "Vowels" if you want to find matches based only on the sequence of vowels from the end, or "Syllables/Letters" for searching for an exact match of the last characters.
4.  **Fuzzy Search:** Check this box if you want to enable searching for similar-sounding letters (e.g., "o" will be considered similar to "yo"/'ё').
5.  **"Find" Button:** Click to initiate the search and highlight matches.
6.  **Match List:** The "Matches" section will display a list of lines where a rhyme was found. Click on a list item to scroll to that line in the text.
7.  **Text History:** Use the "<" (Undo) and ">" (Redo) buttons to navigate through your text's history of changes.
8.  **Theme:** The button with sun/moon icons toggles between the light and dark themes.

## Future Plans

- Accounting for stress/accents (requires a database of accents and more complex logic).
- (Your ideas?)

## Technologies Used

- HTML5
- CSS3
- JavaScript (Vanilla JS)
- Font Awesome (for icons)
