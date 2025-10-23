import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  TextField, 
  InputAdornment, 
  IconButton, 
  Paper, 
  List, 
  ListItem, 
  ListItemButton,
  Typography,
  Box,
  Chip,
  CircularProgress
} from '@mui/material';
import { 
  Search as SearchIcon, 
  Clear as ClearIcon,
  Person as PersonIcon,
  Category as CategoryIcon,
  Event as EventIcon,
  AccountCircle as ProfileIcon,
  Dashboard as DashboardIcon
} from '@mui/icons-material';
import { searchGlobal } from '../services/search';

interface SearchResult {
  id: string;
  type: 'provider' | 'category' | 'appointment' | 'profile' | 'dashboard';
  title: string;
  subtitle?: string;
  description?: string;
}

interface SearchBarProps {
  placeholder?: string;
}

function SearchBar({ placeholder = "Buscar proveedores, categorías..." }: SearchBarProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  
  const navigate = useNavigate();
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Cerrar dropdown al hacer click fuera
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSelectedIndex(-1);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Manejar búsqueda con debounce
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setIsOpen(false);
      return;
    }

    const timeoutId = setTimeout(async () => {
      setIsLoading(true);
      try {
        const searchResults = await searchGlobal(query);
        setResults(searchResults);
        setIsOpen(true);
        setSelectedIndex(-1);
      } catch (error) {
        console.error('Error searching:', error);
        setResults([]);
      } finally {
        setIsLoading(false);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [query]);

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(event.target.value);
  };

  const handleClear = () => {
    setQuery('');
    setResults([]);
    setIsOpen(false);
    setSelectedIndex(-1);
    inputRef.current?.focus();
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (!isOpen || results.length === 0) return;

    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        setSelectedIndex(prev => 
          prev < results.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        event.preventDefault();
        setSelectedIndex(prev => prev > 0 ? prev - 1 : -1);
        break;
      case 'Enter':
        event.preventDefault();
        if (selectedIndex >= 0 && selectedIndex < results.length) {
          handleResultClick(results[selectedIndex]);
        } else if (query.trim()) {
          handleSearchSubmit();
        }
        break;
      case 'Escape':
        setIsOpen(false);
        setSelectedIndex(-1);
        break;
    }
  };

  const handleResultClick = (result: SearchResult) => {
    setIsOpen(false);
    setQuery('');
    setResults([]);
    setSelectedIndex(-1);

    // Navegar según el tipo de resultado
    switch (result.type) {
      case 'provider':
        navigate(`/solicitar?provider=${result.id}`);
        break;
      case 'category':
        navigate(`/solicitar?category=${result.id}`);
        break;
      case 'appointment':
        navigate(`/mis-turnos`);
        break;
      case 'profile':
        navigate(`/perfil`);
        break;
      case 'dashboard':
        navigate(`/perfil`);
        break;
    }
  };

  const handleSearchSubmit = () => {
    if (query.trim()) {
      setIsOpen(false);
      setQuery('');
      setResults([]);
      
      // Si hay resultados, navegar al primero
      if (results.length > 0) {
        handleResultClick(results[0]);
      } else {
        // Si no hay resultados, navegar a solicitar turno con la búsqueda
        navigate(`/solicitar?search=${encodeURIComponent(query)}`);
      }
    }
  };

  const getResultIcon = (type: string) => {
    switch (type) {
      case 'provider':
        return <PersonIcon fontSize="small" />;
      case 'category':
        return <CategoryIcon fontSize="small" />;
      case 'appointment':
        return <EventIcon fontSize="small" />;
      case 'profile':
        return <ProfileIcon fontSize="small" />;
      case 'dashboard':
        return <DashboardIcon fontSize="small" />;
      default:
        return <SearchIcon fontSize="small" />;
    }
  };

  const getResultTypeLabel = (type: string) => {
    switch (type) {
      case 'provider':
        return 'Proveedor';
      case 'category':
        return 'Categoría';
      case 'appointment':
        return 'Turno';
      case 'profile':
        return 'Perfil';
      case 'dashboard':
        return 'Dashboard';
      default:
        return 'Resultado';
    }
  };

  return (
    <Box ref={searchRef} sx={{ position: 'relative', width: '100%', maxWidth: 400 }}>
      <TextField
        ref={inputRef}
        fullWidth
        size="small"
        placeholder={placeholder}
        value={query}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        onFocus={() => query && setIsOpen(true)}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon color="action" />
            </InputAdornment>
          ),
          endAdornment: (
            <InputAdornment position="end">
              {isLoading ? (
                <CircularProgress size={20} />
              ) : query ? (
                <IconButton size="small" onClick={handleClear}>
                  <ClearIcon fontSize="small" />
                </IconButton>
              ) : null}
            </InputAdornment>
          ),
        }}
        sx={{
          '& .MuiOutlinedInput-root': {
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
            '& fieldset': {
              borderColor: 'rgba(255, 255, 255, 0.3)',
            },
            '&:hover fieldset': {
              borderColor: 'rgba(255, 255, 255, 0.5)',
            },
            '&.Mui-focused fieldset': {
              borderColor: 'rgba(255, 255, 255, 0.8)',
            },
          },
          '& .MuiInputBase-input': {
            color: 'white',
            '&::placeholder': {
              color: 'rgba(255, 255, 255, 0.7)',
              opacity: 1,
            },
          },
        }}
      />

      {/* Dropdown de resultados */}
      {isOpen && (
        <Paper
          elevation={8}
          sx={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            zIndex: 1000,
            maxHeight: 300,
            overflow: 'auto',
            mt: 1,
          }}
        >
          {results.length > 0 ? (
            <List dense>
              {results.map((result, index) => (
                <ListItem key={`${result.type}-${result.id}`} disablePadding>
                  <ListItemButton
                    selected={index === selectedIndex}
                    onClick={() => handleResultClick(result)}
                    sx={{
                      '&.Mui-selected': {
                        backgroundColor: 'primary.light',
                        '&:hover': {
                          backgroundColor: 'primary.light',
                        },
                      },
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, width: '100%' }}>
                      {getResultIcon(result.type)}
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography variant="body2" noWrap>
                          {result.title}
                        </Typography>
                        {result.subtitle && (
                          <Typography variant="caption" color="text.secondary" noWrap>
                            {result.subtitle}
                          </Typography>
                        )}
                      </Box>
                      <Chip
                        label={getResultTypeLabel(result.type)}
                        size="small"
                        variant="outlined"
                        color="primary"
                      />
                    </Box>
                  </ListItemButton>
                </ListItem>
              ))}
            </List>
          ) : query && !isLoading ? (
            <Box sx={{ p: 2, textAlign: 'center' }}>
              <Typography variant="body2" color="text.secondary">
                No se encontraron resultados para "{query}"
              </Typography>
            </Box>
          ) : null}
        </Paper>
      )}
    </Box>
  );
}

export default SearchBar;
