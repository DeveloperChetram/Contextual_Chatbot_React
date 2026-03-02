import { createSlice } from '@reduxjs/toolkit';

const customCharacterSlice = createSlice({
    name: 'customCharacters',
    initialState: {
        items: [],
        loading: false,
        error: null,
    },
    reducers: {
        setCustomCharacters(state, action) {
            state.items = action.payload;
        },
        addCustomCharacter(state, action) {
            state.items.unshift(action.payload);
        },
        updateCustomCharacter(state, action) {
            const { id, updates } = action.payload;
            const idx = state.items.findIndex((c) => c._id === id);
            if (idx !== -1) state.items[idx] = { ...state.items[idx], ...updates };
        },
        removeCustomCharacter(state, action) {
            state.items = state.items.filter((c) => c._id !== action.payload);
        },
        setCustomCharacterLoading(state, action) {
            state.loading = action.payload;
        },
        setCustomCharacterError(state, action) {
            state.error = action.payload;
        },
    },
});

export const {
    setCustomCharacters,
    addCustomCharacter,
    updateCustomCharacter,
    removeCustomCharacter,
    setCustomCharacterLoading,
    setCustomCharacterError,
} = customCharacterSlice.actions;

export default customCharacterSlice.reducer;
