import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  CardActions,
  Button,
  Chip,
  CircularProgress,
  Alert,
  Tabs,
  Tab,
  List,
  ListItem,
  ListItemText,
  ListItemButton,
  Divider,
  Avatar
} from '@mui/material';
import {
  Person as PersonIcon,
  Category as CategoryIcon,
  Event as EventIcon,
  Search as SearchIcon
} from '@mui/icons-material';
import { searchGlobal, searchProvidersByCategory, ProviderSearchResult, CategorySearchResult } from '../services/search';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`search-tabpanel-${index}`}
      aria-labelledby={`search-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

function SearchResults() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Resultados por tipo
  const [providers, setProviders] = useState<ProviderSearchResult[]>([]);
  const [categories, setCategories] = useState<CategorySearchResult[]>([]);
  const [appointments, setAppointments] = useState<any[]>([]);
  
  const query = searchParams.get('q') || '';
  const categoryFilter = searchParams.get('category') || '';
  
  // Verificar si el usuario está autenticado
  const isAuthenticated = !!localStorage.getItem('accessToken');

  useEffect(() => {
    if (query || categoryFilter) {
      performSearch();
    }
  }, [query, categoryFilter]);

  const performSearch = async () => {
    setIsLoading(true);
    setError(null);

    try {
      if (categoryFilter) {
        // Búsqueda por categoría específica
        const categoryProviders = await searchProvidersByCategory(categoryFilter);
        setProviders(categoryProviders);
        setCategories([]);
        setAppointments([]);
      } else if (query) {
        // Búsqueda global
        const allResults = await searchGlobal(query);
        
        // Separar resultados por tipo
        const providersResults: ProviderSearchResult[] = [];
        const categoriesResults: CategorySearchResult[] = [];
        const appointmentsResults: any[] = [];

        for (const result of allResults) {
          switch (result.type) {
            case 'provider':
              providersResults.push({
                userId: result.id,
                Name: result.title,
                Description: result.description,
                Category: result.subtitle ? { CategoryID: '', Name: result.subtitle } : undefined
              });
              break;
            case 'category':
              categoriesResults.push({
                CategoryID: result.id,
                Name: result.title
              });
              break;
            case 'appointment':
              appointmentsResults.push({
                AppointmentID: result.id,
                title: result.title,
                subtitle: result.subtitle,
                description: result.description
              });
              break;
          }
        }

        setProviders(providersResults);
        setCategories(categoriesResults);
        setAppointments(appointmentsResults);
      }
    } catch (err) {
      setError('Error al realizar la búsqueda. Inténtalo de nuevo.');
      console.error('Search error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const handleProviderClick = (providerId: string) => {
    navigate(`/serviceprovider/${providerId}`);
  };

  const handleCategoryClick = (categoryId: string) => {
    navigate(`/search?category=${categoryId}`);
  };

  const handleAppointmentClick = () => {
    navigate('/mis-turnos');
  };

  if (isLoading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
          <CircularProgress size={60} />
        </Box>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          {categoryFilter ? 'Proveedores por categoría' : 'Resultados de búsqueda'}
        </Typography>
        {query && (
          <Typography variant="body1" color="text.secondary">
            Resultados para: <strong>"{query}"</strong>
          </Typography>
        )}
        {categoryFilter && (
          <Typography variant="body1" color="text.secondary">
            Categoría: <strong>"{categoryFilter}"</strong>
          </Typography>
        )}
      </Box>

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={activeTab} onChange={handleTabChange} aria-label="search results tabs">
          <Tab 
            icon={<PersonIcon />} 
            label={`Proveedores (${providers.length})`} 
            iconPosition="start"
          />
          <Tab 
            icon={<CategoryIcon />} 
            label={`Categorías (${categories.length})`} 
            iconPosition="start"
          />
          {isAuthenticated && (
            <Tab 
              icon={<EventIcon />} 
              label={`Turnos (${appointments.length})`} 
              iconPosition="start"
            />
          )}
        </Tabs>
      </Box>

      {/* Tab Panels */}
      <TabPanel value={activeTab} index={0}>
        {providers.length > 0 ? (
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
            {providers.map((provider) => (
              <Box key={provider.userId} sx={{ flex: '1 1 300px', minWidth: 300 }}>
                <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Box display="flex" alignItems="center" mb={2}>
                      <Avatar sx={{ mr: 2, bgcolor: 'primary.main' }}>
                        <PersonIcon />
                      </Avatar>
                      <Box>
                        <Typography variant="h6" component="h3" noWrap>
                          {provider.Name}
                        </Typography>
                        {provider.Category && (
                          <Chip 
                            label={provider.Category.Name} 
                            size="small" 
                            color="primary" 
                            variant="outlined"
                          />
                        )}
                      </Box>
                    </Box>
                    {provider.Description && (
                      <Typography variant="body2" color="text.secondary" noWrap>
                        {provider.Description}
                      </Typography>
                    )}
                  </CardContent>
                  <CardActions>
                    <Button 
                      size="small" 
                      onClick={() => handleProviderClick(provider.userId)}
                    >
                      Ver Perfil
                    </Button>
                  </CardActions>
                </Card>
              </Box>
            ))}
          </Box>
        ) : (
          <Box textAlign="center" py={4}>
            <SearchIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" color="text.secondary">
              No se encontraron proveedores
            </Typography>
          </Box>
        )}
      </TabPanel>

      <TabPanel value={activeTab} index={1}>
        {categories.length > 0 ? (
          <List>
            {categories.map((category, index) => (
              <React.Fragment key={category.CategoryID}>
                <ListItem disablePadding>
                  <ListItemButton onClick={() => handleCategoryClick(category.CategoryID)}>
                    <ListItemText
                      primary={category.Name}
                      secondary="Categoría de servicios"
                    />
                  </ListItemButton>
                </ListItem>
                {index < categories.length - 1 && <Divider />}
              </React.Fragment>
            ))}
          </List>
        ) : (
          <Box textAlign="center" py={4}>
            <CategoryIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" color="text.secondary">
              No se encontraron categorías
            </Typography>
          </Box>
        )}
      </TabPanel>

      {isAuthenticated && (
        <TabPanel value={activeTab} index={2}>
          {appointments.length > 0 ? (
            <List>
              {appointments.map((appointment, index) => (
                <React.Fragment key={appointment.AppointmentID}>
                  <ListItem disablePadding>
                    <ListItemButton onClick={handleAppointmentClick}>
                      <ListItemText
                        primary={appointment.title}
                        secondary={appointment.subtitle}
                      />
                    </ListItemButton>
                  </ListItem>
                  {index < appointments.length - 1 && <Divider />}
                </React.Fragment>
              ))}
            </List>
          ) : (
            <Box textAlign="center" py={4}>
              <EventIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h6" color="text.secondary">
                No se encontraron turnos
              </Typography>
            </Box>
          )}
        </TabPanel>
      )}
    </Container>
  );
}

export default SearchResults;
