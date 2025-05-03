document.addEventListener('DOMContentLoaded', () => {
	// --- DOM Элементы ---
	const textEditor = document.getElementById('text-editor')
	const searchInput = document.getElementById('search-input')
	const searchButton = document.getElementById('search-button')
	const matchList = document.getElementById('match-list')
	const matchCount = document.getElementById('match-count')
	const themeToggle = document.getElementById('theme-toggle')
	const undoBtn = document.getElementById('undo-btn')
	const redoBtn = document.getElementById('redo-btn')
	const searchTypeRadios = document.querySelectorAll(
		'input[name="search-type"]'
	)
	const fuzzySearchCheckbox = document.getElementById('fuzzy-search')

	// --- Константы и Состояние ---
	const LOCALSTORAGE_TEXT_KEY = 'rhymitty_text'
	const LOCALSTORAGE_THEME_KEY = 'rhymitty_theme'
	const LOCALSTORAGE_HISTORY_KEY = 'rhymitty_history'
	const HISTORY_LIMIT = 10 // Увеличил лимит истории

	let currentText = ''
	let textHistory = []
	let historyIndex = -1
	let currentMatches = [] // Массив для хранения найденных элементов
	let isUpdatingFromHistory = false // Флаг для предотвращения записи истории при undo/redo
	let debounceTimer

	// --- Инициализация ---
	function init() {
		// Загрузка темы
		const savedTheme = localStorage.getItem(LOCALSTORAGE_THEME_KEY)
		if (savedTheme) {
			document.body.classList.add(savedTheme)
		} else if (
			window.matchMedia &&
			window.matchMedia('(prefers-color-scheme: dark)').matches
		) {
			document.body.classList.add('dark-theme') // Установка темной темы по умолчанию, если системная
		}
		updateThemeButton() // Обновить иконку кнопки темы

		// Загрузка истории
		const savedHistory = localStorage.getItem(LOCALSTORAGE_HISTORY_KEY)
		if (savedHistory) {
			try {
				textHistory = JSON.parse(savedHistory)
				historyIndex = textHistory.length - 1
			} catch (e) {
				console.error('Ошибка парсинга истории:', e)
				textHistory = []
				historyIndex = -1
			}
		}

		// Загрузка текста (приоритет у последнего состояния истории)
		const savedText =
			textHistory[historyIndex] !== undefined
				? textHistory[historyIndex]
				: localStorage.getItem(LOCALSTORAGE_TEXT_KEY)
		if (savedText) {
			currentText = savedText
			// Важно: Использовать innerText для установки в contenteditable,
			// чтобы избежать проблем с HTML тегами при загрузке
			textEditor.innerText = currentText
		}

		// Если истории нет, но есть сохраненный текст (старая версия), добавляем его в историю
		if (
			textHistory.length === 0 &&
			localStorage.getItem(LOCALSTORAGE_TEXT_KEY)
		) {
			addToHistory(localStorage.getItem(LOCALSTORAGE_TEXT_KEY))
		} else {
			updateHistoryButtons()
		}

		// Если текст пустой и истории нет, добавляем начальное пустое состояние
		if (textHistory.length === 0 && !textEditor.innerText) {
			addToHistory('')
		}

		// Добавление слушателей событий
		textEditor.addEventListener('input', handleTextInput)
		searchButton.addEventListener('click', performSearch)
		searchInput.addEventListener('keyup', event => {
			if (event.key === 'Enter') {
				performSearch()
			} else {
				// Дебаунсинг для поиска при вводе (опционально)
				// clearTimeout(debounceTimer);
				// debounceTimer = setTimeout(performSearch, 300);
			}
		})
		themeToggle.addEventListener('click', toggleTheme)
		undoBtn.addEventListener('click', undo)
		redoBtn.addEventListener('click', redo)
		matchList.addEventListener('click', handleMatchClick)
		// Добавляем слушатели для опций поиска, чтобы перерисовывать подсветку
		searchTypeRadios.forEach(radio =>
			radio.addEventListener('change', performSearch)
		)
		fuzzySearchCheckbox.addEventListener('change', performSearch)

		// Первичный поиск, если в поле поиска что-то есть (например, после перезагрузки)
		if (searchInput.value.trim()) {
			performSearch()
		}
	}

	// --- Обработка ввода текста ---
	function handleTextInput() {
		if (isUpdatingFromHistory) return // Не обрабатывать ввод, если это результат undo/redo

		const newText = textEditor.innerText // Получаем чистый текст
		if (newText !== currentText) {
			currentText = newText
			localStorage.setItem(LOCALSTORAGE_TEXT_KEY, currentText) // Сохраняем текущий текст
			addToHistory(currentText) // Добавляем в историю

			// НЕ вызываем clearHighlights здесь!

			// Очищать список совпадений при редактировании текста - хорошая идея,
			// так как старые совпадения могут стать неактуальными.
			clearMatchList()
			matchCount.textContent = '0' // Сбрасываем счетчик
			currentMatches = [] // Очищаем массив совпадений

			// Если в поле поиска что-то есть, можно опционально *погасить* старую подсветку,
			// но не перестраивая весь HTML, а убирая класс .highlight.
			// Это сложнее, проще оставить как есть - подсветка пропадет при следующем поиске.
			// Или просто оставить старую подсветку до следующего поиска.
		}
	}

	// --- Управление Историей ---
	function addToHistory(text) {
		// Если текущий индекс не последний, обрезаем историю
		if (historyIndex < textHistory.length - 1) {
			textHistory = textHistory.slice(0, historyIndex + 1)
		}

		// Не добавлять, если текст совпадает с последним в истории
		if (
			textHistory.length > 0 &&
			text === textHistory[textHistory.length - 1]
		) {
			return
		}

		textHistory.push(text)

		// Ограничиваем размер истории
		if (textHistory.length > HISTORY_LIMIT) {
			textHistory.shift() // Удаляем самый старый элемент
		}

		historyIndex = textHistory.length - 1
		saveHistory()
		updateHistoryButtons()
	}

	function saveHistory() {
		try {
			localStorage.setItem(
				LOCALSTORAGE_HISTORY_KEY,
				JSON.stringify(textHistory)
			)
		} catch (e) {
			console.error('Ошибка сохранения истории:', e)
			// Возможно, localStorage переполнен
		}
	}

	function undo() {
		if (historyIndex > 0) {
			historyIndex--
			isUpdatingFromHistory = true // Устанавливаем флаг
			textEditor.innerText = textHistory[historyIndex] // Используем innerText
			currentText = textHistory[historyIndex]
			localStorage.setItem(LOCALSTORAGE_TEXT_KEY, currentText) // Сохраняем откаченное состояние
			isUpdatingFromHistory = false // Снимаем флаг
			updateHistoryButtons()
			performSearch() // Обновляем подсветку
		}
	}

	function redo() {
		if (historyIndex < textHistory.length - 1) {
			historyIndex++
			isUpdatingFromHistory = true // Устанавливаем флаг
			textEditor.innerText = textHistory[historyIndex] // Используем innerText
			currentText = textHistory[historyIndex]
			localStorage.setItem(LOCALSTORAGE_TEXT_KEY, currentText) // Сохраняем возвращенное состояние
			isUpdatingFromHistory = false // Снимаем флаг
			updateHistoryButtons()
			performSearch() // Обновляем подсветку
		}
	}

	function updateHistoryButtons() {
		undoBtn.disabled = historyIndex <= 0
		redoBtn.disabled = historyIndex >= textHistory.length - 1
	}

	// --- Логика Поиска ---
	function performSearch() {
		const query = searchInput.value.trim().toLowerCase()
		const searchType = document.querySelector(
			'input[name="search-type"]:checked'
		).value
		const useFuzzySearch = fuzzySearchCheckbox.checked

		// Сохраняем текущую позицию курсора (если возможно и нужно)
		// const selection = window.getSelection();
		// const range = selection.rangeCount > 0 ? selection.getRangeAt(0) : null;
		// const startContainer = range?.startContainer;
		// const startOffset = range?.startOffset;

		clearHighlights() // Сначала очищаем старые подсветки
		clearMatchList()
		currentMatches = [] // Очищаем массив найденных элементов

		if (!query) {
			textEditor.innerHTML = currentText.replace(/\n/g, '<br>') // Просто отображаем текст без подсветки
			// Восстанавливаем курсор (сложно и может не работать идеально)
			// restoreCursor(startContainer, startOffset);
			return // Выходим, если запрос пустой
		}

		// Получаем чистый текст из редактора перед обработкой
		const rawText = textEditor.innerText // Важно брать актуальный innerText
		const lines = rawText.split('\n')
		let newHTML = ''
		let matchIndex = 0

		lines.forEach((line, lineIndex) => {
			const trimmedLine = line.trimEnd() // Убираем пробелы только в конце
			if (!trimmedLine) {
				newHTML += `<div><br></div>` // Сохраняем пустую строку как div с <br>
				return
			}

			let lineEnding = trimmedLine // По умолчанию ищем во всей строке (для простоты)
			let normalizedQuery = query

			// 1. Фильтрация и нормализация для поиска по гласным
			if (searchType === 'vowels') {
				lineEnding = filterVowels(lineEnding.toLowerCase())
				normalizedQuery = filterVowels(normalizedQuery)
			}

			// 2. Применение неточного поиска (если включено)
			if (useFuzzySearch) {
				lineEnding = fuzzyNormalize(lineEnding)
				normalizedQuery = fuzzyNormalize(normalizedQuery)
			}

			// 3. Основная логика поиска с конца
			const reversedEnding = reverseString(lineEnding)
			const reversedQuery = reverseString(normalizedQuery)

			if (reversedEnding.startsWith(reversedQuery)) {
				// Нашли совпадение! Определяем, какую часть подсветить в *оригинальной* строке
				const matchLengthInOriginal = calculateMatchLength(
					trimmedLine,
					normalizedQuery,
					searchType,
					useFuzzySearch
				)

				if (matchLengthInOriginal > 0) {
					const highlightStart = trimmedLine.length - matchLengthInOriginal
					const before = escapeHtml(trimmedLine.substring(0, highlightStart))
					const highlighted = escapeHtml(trimmedLine.substring(highlightStart))
					const matchId = `match-${matchIndex}`

					// Добавляем div для строки с уникальным ID
					newHTML += `<div id="${matchId}">${before}<span class="highlight">${highlighted}</span></div>`

					// Добавляем в список совпадений
					addMatchToList(trimmedLine, highlighted, matchId, lineIndex)
					matchIndex++
				} else {
					// Совпадение найдено по гласным/неточно, но не можем точно определить длину в оригинале - просто добавляем без подсветки
					newHTML += `<div>${escapeHtml(trimmedLine)}</div>`
				}
			} else {
				// Нет совпадения, просто добавляем строку
				newHTML += `<div>${escapeHtml(trimmedLine)}</div>`
			}
		})

		textEditor.innerHTML = newHTML // Обновляем редактор с подсветкой
		matchCount.textContent = currentMatches.length

		// Восстанавливаем курсор (сложно и может не работать идеально)
		// restoreCursor(startContainer, startOffset);
	}

	// Вспомогательная функция для определения длины подсветки в оригинальной строке
	function calculateMatchLength(
		originalLineEnd,
		query,
		searchType,
		useFuzzySearch
	) {
		// Эта функция самая сложная, т.к. нужно учесть гласные/неточность
		// Простая версия для начала: ищем точное совпадение query с конца originalLineEnd
		let processedQuery = query
		let processedOriginal = originalLineEnd.toLowerCase()

		if (searchType === 'vowels') {
			// Для гласных - ищем последнюю гласную из запроса и считаем символы до конца
			const queryVowels = filterVowels(query)
			if (!queryVowels) return 0
			const lastQueryVowel = queryVowels[queryVowels.length - 1]
			const originalVowels = filterVowels(originalLineEnd.toLowerCase())
			if (!originalVowels) return 0

			let lastOriginalVowelIndex = -1
			for (let i = originalLineEnd.length - 1; i >= 0; i--) {
				if (isVowel(originalLineEnd[i].toLowerCase())) {
					lastOriginalVowelIndex = i
					break
				}
			}
			if (lastOriginalVowelIndex === -1) return 0

			// Сравним последовательности гласных с конца
			let originalVowelsSuffix = ''
			let tempIndex = originalLineEnd.length - 1
			while (
				originalVowelsSuffix.length < queryVowels.length &&
				tempIndex >= 0
			) {
				const char = originalLineEnd[tempIndex].toLowerCase()
				if (isVowel(char)) {
					originalVowelsSuffix = char + originalVowelsSuffix
				}
				tempIndex--
			}

			if (
				fuzzyNormalize(originalVowelsSuffix) === fuzzyNormalize(queryVowels)
			) {
				// Нашли совпадение гласных. Теперь ищем индекс первого совпавшего гласного в оригинале
				let currentQueryVowelIndex = queryVowels.length - 1
				for (let i = originalLineEnd.length - 1; i >= 0; i--) {
					const char = originalLineEnd[i].toLowerCase()
					if (isVowel(char)) {
						if (fuzzyCharMatch(char, queryVowels[currentQueryVowelIndex])) {
							currentQueryVowelIndex--
							if (currentQueryVowelIndex < 0) {
								// Нашли начало совпадения гласных в оригинале
								return originalLineEnd.length - i
							}
						} else {
							return 0 // Последовательность не совпала
						}
					}
				}
				return 0 // Не должно произойти, но на всякий случай
			} else {
				return 0 // Последовательности гласных не совпали
			}
		} else {
			// Для слогов/букв
			let tempQuery = useFuzzySearch ? fuzzyNormalize(query) : query
			let tempOriginal = originalLineEnd.toLowerCase()
			let originalSuffix = useFuzzySearch
				? fuzzyNormalize(tempOriginal.slice(-tempQuery.length))
				: tempOriginal.slice(-tempQuery.length)

			if (originalSuffix === tempQuery) {
				return query.length // Длина подсветки равна длине запроса
			} else {
				// Попробуем уменьшать длину запроса для неточного поиска (очень упрощенно)
				if (useFuzzySearch && query.length > 1) {
					for (let len = query.length - 1; len > 0; len--) {
						tempQuery = fuzzyNormalize(query.slice(-len))
						originalSuffix = fuzzyNormalize(
							originalLineEnd.toLowerCase().slice(-len)
						)
						if (originalSuffix === tempQuery) return len
					}
				}
				return 0 // Не нашли совпадения
			}
		}
	}

	function clearHighlights() {
		// Самый простой способ - пересоздать HTML из чистого текста
		// Это приведет к потере позиции курсора
		const plainText = textEditor.innerText // Получаем чистый текст
		// Заменяем переносы строк на <br> или оборачиваем строки в div для сохранения структуры
		const htmlText = plainText
			.split('\n')
			.map(line => `<div>${escapeHtml(line) || '<br>'}</div>`)
			.join('')
		textEditor.innerHTML = htmlText
		// Сохраняем чистый текст, если он изменился (маловероятно здесь, но на всякий случай)
		if (currentText !== plainText) {
			currentText = plainText
			localStorage.setItem(LOCALSTORAGE_TEXT_KEY, currentText)
			// Не добавляем в историю при простой очистке подсветки
		}
	}

	function clearMatchList() {
		matchList.innerHTML = ''
		matchCount.textContent = '0'
	}

	function addMatchToList(lineText, highlightedPart, elementId, lineIndex) {
		const li = document.createElement('li')
		li.dataset.targetId = elementId // Сохраняем ID целевого элемента
		li.dataset.lineIndex = lineIndex // Сохраняем индекс строки (на всякий случай)
		// Показываем часть строки до и подсвеченную часть
		const contextLength = 20 // Сколько символов показывать до подсветки
		const highlightStartInLine = lineText
			.toLowerCase()
			.lastIndexOf(highlightedPart.toLowerCase()) // Находим позицию подсветки
		const context =
			highlightStartInLine > contextLength
				? '...' +
				  lineText.substring(
						highlightStartInLine - contextLength,
						highlightStartInLine
				  )
				: lineText.substring(0, highlightStartInLine)

		li.innerHTML = `${escapeHtml(context)}<mark>${escapeHtml(
			highlightedPart
		)}</mark>`
		li.title = lineText // Полная строка во всплывающей подсказке
		matchList.appendChild(li)
		currentMatches.push({ elementId, lineIndex, text: lineText }) // Сохраняем информацию о совпадении
	}

	function handleMatchClick(event) {
		const targetLi = event.target.closest('li')
		if (targetLi && targetLi.dataset.targetId) {
			const targetElement = document.getElementById(targetLi.dataset.targetId)
			if (targetElement) {
				targetElement.scrollIntoView({ behavior: 'smooth', block: 'center' })
				// Дополнительно можно как-то выделить строку, куда перешли
				targetElement.style.transition = 'background-color 0.5s ease-out'
				targetElement.style.backgroundColor = 'rgba(0, 123, 255, 0.1)' // Легкая временная подсветка
				setTimeout(() => {
					targetElement.style.backgroundColor = ''
				}, 1000) // Убрать подсветку через секунду
			}
		}
	}

	// --- Вспомогательные функции ---
	function filterVowels(str) {
		return str
			.split('')
			.filter(char => isVowel(char))
			.join('')
	}

	const VOWELS = 'аеёиоуыэюяaeiouy' // Добавил английские на всякий случай
	function isVowel(char) {
		return VOWELS.includes(char.toLowerCase())
	}

	function reverseString(str) {
		return str.split('').reverse().join('')
	}

	// Очень простая функция неточного поиска
	const fuzzyMap = {
		ё: 'е',
		я: 'а',
		э: 'е',
		// Можно добавить больше пар, например, согласные
		л: 'р', // Как в примере
		р: 'л',
		// 'б': 'п', 'п': 'б',
		// 'з': 'с', 'с': 'з',
		// 'д': 'т', 'т': 'д',
		// 'г': 'к', 'к': 'г',
		// 'ж': 'ш', 'ш': 'ж',
	}

	function fuzzyNormalize(str) {
		return str
			.toLowerCase()
			.split('')
			.map(char => fuzzyMap[char] || char)
			.join('')
	}

	// Функция сравнения символов с учетом неточности
	function fuzzyCharMatch(char1, char2) {
		const c1 = char1.toLowerCase()
		const c2 = char2.toLowerCase()
		if (c1 === c2) return true
		if (fuzzyMap[c1] === c2 || fuzzyMap[c2] === c1) return true
		// Если нормализованные символы совпадают (например, е и ё -> е)
		if ((fuzzyMap[c1] || c1) === (fuzzyMap[c2] || c2)) return true
		return false
	}

	function escapeHtml(unsafe) {
		return unsafe
			.replace(/&/g, '&')
			.replace(/</g, '<')
			.replace(/>/g, '>')
			.replace(/"/g, '"')
			.replace(/'/g, "'")
	}

	// --- Управление Темой ---
	function toggleTheme() {
		document.body.classList.toggle('dark-theme')
		const currentTheme = document.body.classList.contains('dark-theme')
			? 'dark-theme'
			: ''
		localStorage.setItem(LOCALSTORAGE_THEME_KEY, currentTheme)
		updateThemeButton()
	}

	function updateThemeButton() {
		// Можно добавить изменение иконки на кнопке в зависимости от темы
		// Например, показывать иконку солнца на темной теме и луны на светлой
		const isDark = document.body.classList.contains('dark-theme')
		const icon = themeToggle.querySelector('i')
		// Пример: <button id="theme-toggle" class="btn"><i class="fas fa-sun"></i> / <i class="fas fa-moon"></i></button>
		// Здесь можно было бы скрывать/показывать нужную иконку, но для простоты оставим обе
	}

	// --- Запуск ---
	init()
})
