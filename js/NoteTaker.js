// Professional Note Taker JavaScript - Enhanced Version
let notes = [];
let currentNoteId = null;
let noteIdCounter = 1;
let filteredNotes = [];
let saveTimeout = null;
let hasUnsavedChanges = false;

// Initialize the app
document.addEventListener("DOMContentLoaded", function () {
  try {
    loadNotesFromMemory();
    renderNotesList();
    updateButtonStates();
    showNotification("Note Taker loaded successfully!", "success");
  } catch (error) {
    console.error("Error initializing app:", error);
    showNotification("Error loading notes. Starting fresh.", "warning");
  }
});

// Enhanced notification system
function showNotification(message, type = "info") {
  const notification = document.getElementById("notification");
  notification.textContent = message;
  notification.className = `notification ${type} show`;

  setTimeout(() => {
    notification.classList.remove("show");
  }, 3000);
}

// Create a new note
function createNewNote() {
  const newNote = {
    id: noteIdCounter++,
    title: "Untitled Note",
    content: "",
    category: "General",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  notes.unshift(newNote);
  currentNoteId = newNote.id;
  hasUnsavedChanges = false;

  saveNotesToMemory();
  renderNotesList();
  showNoteEditor(newNote);
  updateButtonStates();

  // Focus and select title
  setTimeout(() => {
    const titleInput = document.getElementById("noteTitle");
    titleInput.focus();
    titleInput.select();
  }, 100);

  showNotification("New note created!", "success");
}

// Show note editor with better error handling
function showNoteEditor(note) {
  if (!note) {
    console.error("No note provided to editor");
    return;
  }

  currentNoteId = note.id;
  hasUnsavedChanges = false;

  document.getElementById("noteEditor").style.display = "block";
  document.getElementById("editorPlaceholder").style.display = "none";

  // Safely set values
  const titleInput = document.getElementById("noteTitle");
  const contentInput = document.getElementById("noteContent");
  const categorySelect = document.getElementById("categorySelect");

  if (titleInput) titleInput.value = note.title || "";
  if (contentInput) contentInput.value = note.content || "";
  if (categorySelect) categorySelect.value = note.category || "General";

  updateWordCount();
  updateSaveStatus("All changes saved");

  // Update active state
  document.querySelectorAll(".note-card").forEach((card) => {
    card.classList.remove("active");
  });
  const noteCard = document.getElementById(`note-${note.id}`);
  if (noteCard) {
    noteCard.classList.add("active");
  }
}

// Enhanced save with debouncing and error handling
function handleNoteChange() {
  hasUnsavedChanges = true;
  updateSaveStatus("Unsaved changes...", "saving");
  updateWordCount();

  // Clear existing timeout
  if (saveTimeout) {
    clearTimeout(saveTimeout);
  }

  // Set new timeout for auto-save
  saveTimeout = setTimeout(() => {
    saveCurrentNote();
  }, 1000); // Save after 1 second of inactivity
}

// Save current note with better error handling
function saveCurrentNote() {
  if (!currentNoteId) {
    updateSaveStatus("No note selected", "error");
    return false;
  }

  const noteIndex = notes.findIndex((note) => note.id === currentNoteId);
  if (noteIndex === -1) {
    updateSaveStatus("Note not found", "error");
    return false;
  }

  try {
    const titleInput = document.getElementById("noteTitle");
    const contentInput = document.getElementById("noteContent");
    const categorySelect = document.getElementById("categorySelect");

    const title = (titleInput?.value || "").trim() || "Untitled Note";
    const content = contentInput?.value || "";
    const category = categorySelect?.value || "General";

    notes[noteIndex].title = title;
    notes[noteIndex].content = content;
    notes[noteIndex].category = category;
    notes[noteIndex].updatedAt = new Date().toISOString();

    saveNotesToMemory();
    renderNotesList();
    updateWordCount();
    updateSaveStatus("Saved", "saved");
    hasUnsavedChanges = false;

    // Clear save status after 2 seconds
    setTimeout(() => {
      if (!hasUnsavedChanges) {
        updateSaveStatus("All changes saved");
      }
    }, 2000);

    return true;
  } catch (error) {
    console.error("Error saving note:", error);
    updateSaveStatus("Save failed", "error");
    return false;
  }
}

// Select a note with error handling
function selectNote(noteId) {
  try {
    const note = notes.find((n) => n.id === noteId);
    if (note) {
      // If there are unsaved changes, ask user
      if (hasUnsavedChanges) {
        if (confirm("You have unsaved changes. Save before switching notes?")) {
          if (!saveCurrentNote()) {
            return; // Don't switch if save failed
          }
        }
      }
      showNoteEditor(note);
    } else {
      showNotification("Note not found", "error");
    }
  } catch (error) {
    console.error("Error selecting note:", error);
    showNotification("Error loading note", "error");
  }
}

// Delete a note with better confirmation
function deleteNote(noteId) {
  const note = notes.find((n) => n.id === noteId);
  if (!note) {
    showNotification("Note not found", "error");
    return;
  }

  const confirmMessage = `Are you sure you want to delete "${note.title}"?\n\nThis action cannot be undone.`;

  if (confirm(confirmMessage)) {
    notes = notes.filter((note) => note.id !== noteId);

    if (currentNoteId === noteId) {
      currentNoteId = null;
      hasUnsavedChanges = false;
      document.getElementById("noteEditor").style.display = "none";
      document.getElementById("editorPlaceholder").style.display = "block";
    }

    saveNotesToMemory();
    renderNotesList();
    updateButtonStates();
    showNotification(`"${note.title}" deleted successfully`, "success");
  }
}

// Enhanced filter notes with better performance
function filterNotes() {
  const searchTerm = document
    .getElementById("searchInput")
    .value.toLowerCase()
    .trim();
  const categoryFilter = document.getElementById("categoryFilter").value;

  filteredNotes = notes.filter((note) => {
    const matchesSearch =
      !searchTerm ||
      note.title.toLowerCase().includes(searchTerm) ||
      note.content.toLowerCase().includes(searchTerm) ||
      note.category.toLowerCase().includes(searchTerm);

    const matchesCategory = !categoryFilter || note.category === categoryFilter;

    return matchesSearch && matchesCategory;
  });

  renderNotesList();
}

// Enhanced render notes list with better performance and error handling
function renderNotesList() {
  try {
    const notesList = document.getElementById("notesList");
    const notesToRender =
      document.getElementById("searchInput").value ||
      document.getElementById("categoryFilter").value
        ? filteredNotes
        : notes;

    // Update note count
    updateNoteCount(notesToRender.length, notes.length);

    if (notesToRender.length === 0) {
      const hasFilters =
        document.getElementById("searchInput").value ||
        document.getElementById("categoryFilter").value;
      notesList.innerHTML = `<div class="empty-state">${
        hasFilters
          ? "No notes match your search criteria."
          : 'No notes yet. Click "New Note" to create your first note.'
      }</div>`;
      return;
    }

    const notesHTML = notesToRender
      .map((note) => {
        const preview =
          (note.content || "").substring(0, 120).replace(/\n/g, " ") ||
          "No content";
        const date = formatDate(note.updatedAt);
        const safeTitle = escapeHtml(note.title || "Untitled Note");
        const safePreview = escapeHtml(preview);

        return `
              <div class="note-card ${
                currentNoteId === note.id ? "active" : ""
              }" 
                   id="note-${note.id}" 
                   onclick="selectNote(${note.id})"
                   role="button"
                   tabindex="0"
                   onkeypress="handleNoteCardKeyPress(event, ${note.id})">
                <button class="delete-note" 
                        onclick="event.stopPropagation(); deleteNote(${
                          note.id
                        })" 
                        title="Delete Note"
                        aria-label="Delete note: ${safeTitle}">×</button>
                <div class="note-card-title">${safeTitle}</div>
                <div class="note-card-preview">${safePreview}${
          note.content && note.content.length > 120 ? "..." : ""
        }</div>
                <div class="note-card-meta">
                  <div class="note-category">${escapeHtml(note.category)}</div>
                  <div class="note-date">${date}</div>
                </div>
              </div>
            `;
      })
      .join("");

    notesList.innerHTML = notesHTML;
  } catch (error) {
    console.error("Error rendering notes list:", error);
    document.getElementById("notesList").innerHTML =
      '<div class="empty-state">Error loading notes. Please refresh the page.</div>';
  }
}

// Handle keyboard navigation for note cards
function handleNoteCardKeyPress(event, noteId) {
  if (event.key === "Enter" || event.key === " ") {
    event.preventDefault();
    selectNote(noteId);
  }
}

// Utility function to escape HTML
function escapeHtml(unsafe) {
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

// Enhanced date formatting
function formatDate(dateString) {
  try {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) {
      return "Today";
    } else if (diffDays === 2) {
      return "Yesterday";
    } else if (diffDays <= 7) {
      return `${diffDays - 1} days ago`;
    } else {
      return date.toLocaleDateString();
    }
  } catch (error) {
    return "Unknown date";
  }
}

// Update note count display
function updateNoteCount(filtered, total) {
  const noteCountElement = document.getElementById("noteCount");
  if (filtered === total) {
    noteCountElement.textContent = `(${total} notes)`;
  } else {
    noteCountElement.textContent = `(${filtered} of ${total} notes)`;
  }
}

// Update button states based on notes availability
function updateButtonStates() {
  const hasNotes = notes.length > 0;
  const exportBtn = document.getElementById("exportBtn");
  const clearBtn = document.getElementById("clearBtn");

  if (exportBtn) {
    exportBtn.disabled = !hasNotes;
  }
  if (clearBtn) {
    clearBtn.disabled = !hasNotes;
  }
}

// Enhanced word count with better formatting
function updateWordCount() {
  try {
    const content = document.getElementById("noteContent").value || "";
    const words = content
      .trim()
      .split(/\s+/)
      .filter((word) => word.length > 0).length;
    const characters = content.length;
    const lines = content.split("\n").length;

    document.getElementById(
      "wordCount"
    ).textContent = `${words} words • ${characters} characters • ${lines} lines`;
  } catch (error) {
    console.error("Error updating word count:", error);
  }
}

// Enhanced save status with visual feedback
function updateSaveStatus(status, type = "default") {
  const saveStatusElement = document.getElementById("saveStatus");
  if (saveStatusElement) {
    saveStatusElement.textContent = status;
    saveStatusElement.className = `save-status ${type}`;
  }
}

// Enhanced text formatting with better selection handling
function formatText(command) {
  const textarea = document.getElementById("noteContent");
  const start = textarea.selectionStart;
  const end = textarea.selectionEnd;
  const selectedText = textarea.value.substring(start, end);

  if (!selectedText) {
    showNotification("Please select text to format", "warning");
    return;
  }

  let formattedText = selectedText;

  switch (command) {
    case "bold":
      formattedText = `**${selectedText}**`;
      break;
    case "italic":
      formattedText = `*${selectedText}*`;
      break;
    case "underline":
      formattedText = `_${selectedText}_`;
      break;
  }

  textarea.value =
    textarea.value.substring(0, start) +
    formattedText +
    textarea.value.substring(end);
  textarea.focus();
  textarea.setSelectionRange(start, start + formattedText.length);

  handleNoteChange();
  showNotification(`Text formatted as ${command}`, "success");
}

// Enhanced list insertion
function insertList() {
  const textarea = document.getElementById("noteContent");
  const cursorPosition = textarea.selectionStart;
  const textBefore = textarea.value.substring(0, cursorPosition);
  const textAfter = textarea.value.substring(cursorPosition);

  const listItems = "\n• Item 1\n• Item 2\n• Item 3\n";

  textarea.value = textBefore + listItems + textAfter;
  textarea.focus();
  const newPosition = cursorPosition + 9; // Position after "• Item 1"
  textarea.setSelectionRange(newPosition, newPosition + 1); // Select "1"

  handleNoteChange();
  showNotification("List inserted", "success");
}

// Enhanced date insertion
function insertDate() {
  const textarea = document.getElementById("noteContent");
  const cursorPosition = textarea.selectionStart;
  const textBefore = textarea.value.substring(0, cursorPosition);
  const textAfter = textarea.value.substring(cursorPosition);

  const currentDate = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const dateText = `\nDate: ${currentDate}\n`;

  textarea.value = textBefore + dateText + textAfter;
  textarea.focus();
  textarea.setSelectionRange(
    cursorPosition + dateText.length,
    cursorPosition + dateText.length
  );

  handleNoteChange();
  showNotification("Date inserted", "success");
}

// Enhanced storage using in-memory storage instead of localStorage
function saveNotesToMemory() {
  try {
    // Store in a global variable for this session
    window.tooliNotes = {
      notes: notes,
      noteIdCounter: noteIdCounter,
      currentNoteId: currentNoteId,
      lastSaved: new Date().toISOString(),
    };
  } catch (error) {
    console.error("Error saving notes to memory:", error);
    updateSaveStatus("Save failed - memory error", "error");
  }
}

// Enhanced loading from memory
function loadNotesFromMemory() {
  try {
    if (window.tooliNotes) {
      const notesData = window.tooliNotes;
      notes = notesData.notes || [];
      noteIdCounter = notesData.noteIdCounter || 1;
      currentNoteId = notesData.currentNoteId || null;

      // Ensure all notes have required fields
      notes.forEach((note) => {
        if (!note.category) note.category = "General";
        if (!note.createdAt) note.createdAt = new Date().toISOString();
        if (!note.updatedAt) note.updatedAt = note.createdAt;
      });

      // If there was a current note, show it in the editor
      if (currentNoteId) {
        const currentNote = notes.find((note) => note.id === currentNoteId);
        if (currentNote) {
          showNoteEditor(currentNote);
        } else {
          currentNoteId = null;
        }
      }

      filteredNotes = [...notes];
    }
  } catch (error) {
    console.error("Error loading notes from memory:", error);
    notes = [];
    noteIdCounter = 1;
    currentNoteId = null;
    filteredNotes = [];
  }
}

// Enhanced export with better error handling and metadata
function exportNotes() {
  if (notes.length === 0) {
    showNotification("No notes to export!", "warning");
    return;
  }

  try {
    const exportData = {
      exportDate: new Date().toISOString(),
      version: "2.0",
      totalNotes: notes.length,
      application: "Tooli Professional Note Taker",
      notes: notes,
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `tooli-notes-${new Date().toISOString().split("T")[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    showNotification(`${notes.length} notes exported successfully!`, "success");
  } catch (error) {
    console.error("Error exporting notes:", error);
    showNotification("Error exporting notes", "error");
  }
}

// Enhanced import with better validation
function importNotes() {
  document.getElementById("fileInput").click();
}

// Enhanced file import handling
function handleFileImport(event) {
  const file = event.target.files[0];
  if (!file) return;

  if (file.type !== "application/json" && !file.name.endsWith(".json")) {
    showNotification("Please select a valid JSON file", "error");
    return;
  }

  const reader = new FileReader();
  reader.onload = function (e) {
    try {
      const importData = JSON.parse(e.target.result);

      if (!importData.notes || !Array.isArray(importData.notes)) {
        showNotification(
          "Invalid file format. Please select a valid notes export file.",
          "error"
        );
        return;
      }

      // Validate and clean imported notes
      const validNotes = importData.notes
        .filter((note) => {
          return note && typeof note.title === "string";
        })
        .map((note) => ({
          ...note,
          id: noteIdCounter++,
          category: note.category || "General",
          createdAt: note.createdAt || new Date().toISOString(),
          updatedAt: note.updatedAt || new Date().toISOString(),
        }));

      if (validNotes.length === 0) {
        showNotification("No valid notes found in the file", "warning");
        return;
      }

      // Ask user how to handle the import
      const mergeChoice = confirm(
        `Found ${validNotes.length} notes in the file.\n\n` +
          'Click "OK" to merge with existing notes\n' +
          'Click "Cancel" to replace all notes'
      );

      if (mergeChoice) {
        notes = [...validNotes, ...notes];
      } else {
        notes = validNotes;
        currentNoteId = null;
        document.getElementById("noteEditor").style.display = "none";
        document.getElementById("editorPlaceholder").style.display = "block";
      }

      filteredNotes = [...notes];
      saveNotesToMemory();
      renderNotesList();
      updateButtonStates();

      showNotification(
        `Successfully imported ${validNotes.length} notes!`,
        "success"
      );
    } catch (error) {
      console.error("Error importing notes:", error);
      showNotification(
        "Error reading file. Please make sure it is a valid JSON file.",
        "error"
      );
    }
  };

  reader.readAsText(file);
  event.target.value = ""; // Clear the input
}

// Enhanced clear all with better confirmation
function clearAllNotes() {
  if (notes.length === 0) {
    showNotification("No notes to clear!", "warning");
    return;
  }

  const confirmMessage =
    `Are you sure you want to delete ALL ${notes.length} notes?\n\n` +
    "This action cannot be undone.\n\n" +
    "Consider exporting your notes first!";

  if (confirm(confirmMessage)) {
    notes = [];
    filteredNotes = [];
    noteIdCounter = 1;
    currentNoteId = null;
    hasUnsavedChanges = false;

    document.getElementById("noteEditor").style.display = "none";
    document.getElementById("editorPlaceholder").style.display = "block";
    document.getElementById("searchInput").value = "";
    document.getElementById("categoryFilter").value = "";

    saveNotesToMemory();
    renderNotesList();
    updateButtonStates();

    showNotification("All notes cleared successfully", "success");
  }
}

// Enhanced keyboard shortcuts
document.addEventListener("keydown", function (e) {
  // Ctrl/Cmd + N for new note
  if ((e.ctrlKey || e.metaKey) && e.key === "n") {
    e.preventDefault();
    createNewNote();
  }

  // Ctrl/Cmd + S to save
  if ((e.ctrlKey || e.metaKey) && e.key === "s") {
    e.preventDefault();
    if (currentNoteId) {
      saveCurrentNote();
      showNotification("Note saved!", "success");
    }
  }

  // Ctrl/Cmd + F to focus search
  if ((e.ctrlKey || e.metaKey) && e.key === "f") {
    e.preventDefault();
    document.getElementById("searchInput").focus();
  }

  // Escape to clear search and category filter
  if (e.key === "Escape") {
    if (document.activeElement === document.getElementById("searchInput")) {
      document.getElementById("searchInput").value = "";
      document.getElementById("categoryFilter").value = "";
      filterNotes();
    }
  }

  // Ctrl/Cmd + B for bold
  if (
    (e.ctrlKey || e.metaKey) &&
    e.key === "b" &&
    document.activeElement === document.getElementById("noteContent")
  ) {
    e.preventDefault();
    formatText("bold");
  }

  // Ctrl/Cmd + I for italic
  if (
    (e.ctrlKey || e.metaKey) &&
    e.key === "i" &&
    document.activeElement === document.getElementById("noteContent")
  ) {
    e.preventDefault();
    formatText("italic");
  }

  // Ctrl/Cmd + U for underline
  if (
    (e.ctrlKey || e.metaKey) &&
    e.key === "u" &&
    document.activeElement === document.getElementById("noteContent")
  ) {
    e.preventDefault();
    formatText("underline");
  }
});

// Auto-save timer (backup safety net)
setInterval(() => {
  if (currentNoteId && hasUnsavedChanges) {
    saveCurrentNote();
  }
}, 30000); // Save every 30 seconds if there are unsaved changes

// Handle page unload with unsaved changes warning
window.addEventListener("beforeunload", function (e) {
  if (hasUnsavedChanges) {
    const message = "You have unsaved changes. Are you sure you want to leave?";
    e.returnValue = message;
    return message;
  }

  if (currentNoteId) {
    saveCurrentNote();
  }
});

// Initialize filtered notes
filteredNotes = [...notes];

// Add some sample data for demo purposes (only if no notes exist)
function addSampleNotes() {
  if (notes.length === 0) {
    const sampleNotes = [
      {
        id: noteIdCounter++,
        title: "Note Taker",
        content:
          "This is your first note! You can:\n\n• Create unlimited notes\n• Organize with categories\n• Search through all your content\n• Format text with the toolbar\n• Export/import your notes\n\nStart by editing this note or create a new one.",
        category: "General",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: noteIdCounter++,
        title: "Meeting Notes Template",
        content:
          "Date: [Insert Date]\nAttendees: [List participants]\n\nAgenda:\n• Topic 1\n• Topic 2\n• Topic 3\n\nAction Items:\n• [ ] Task 1 - Owner: [Name]\n• [ ] Task 2 - Owner: [Name]\n\nNext Steps:\n[Outline next meeting or follow-up actions]",
        category: "Meeting",
        createdAt: new Date(Date.now() - 86400000).toISOString(), // Yesterday
        updatedAt: new Date(Date.now() - 86400000).toISOString(),
      },
    ];

    notes = sampleNotes;
    filteredNotes = [...notes];
    saveNotesToMemory();
    renderNotesList();
    updateButtonStates();
  }
}

// Initialize sample notes if needed
setTimeout(addSampleNotes, 100);
