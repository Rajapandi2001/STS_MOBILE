import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  StatusBar,
  Alert,
  Modal,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/context/ThemeContext';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import AdminMenu from '@/admin/components/AdminMenu';
import AdminHeader from '../components/AdminHeader';
import AdminBottomTabNavigator from '../components/AdminBottomTabNavigator';

interface AdminOfficeLocationScreenProps {
  onNavigate?: (screen: string, params?: any) => void;
  onBack?: () => void;
}

interface OfficeLocation {
  id: string;
  name: string;
  officeType: 'HD' | 'Branch' | 'Client';
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
  latitude: number;
  longitude: number;
  radius: number;
  timezone: string;
  status: 'Active' | 'Inactive';
}

const DEFAULT_LOCATIONS: OfficeLocation[] = [
  {
    id: '1',
    name: 'Headquarters (HQ)',
    officeType: 'HD',
    addressLine1: '123 Tech Park Avenue',
    addressLine2: 'Block A, Cyber City',
    city: 'Bengaluru',
    state: 'Karnataka',
    country: 'India',
    postalCode: '560001',
    latitude: 12.9716,
    longitude: 77.5946,
    radius: 150,
    timezone: 'Asia/Kolkata (GMT+5:30)',
    status: 'Active',
  },
  {
    id: '2',
    name: 'Branch Office',
    officeType: 'Branch',
    addressLine1: '456 Business Boulevard',
    addressLine2: 'Sector 4, Metro Hub',
    city: 'Chennai',
    state: 'Tamil Nadu',
    country: 'India',
    postalCode: '600001',
    latitude: 13.0827,
    longitude: 80.2707,
    radius: 200,
    timezone: 'Asia/Kolkata (GMT+5:30)',
    status: 'Active',
  },
  {
    id: '3',
    name: 'R&D Center',
    officeType: 'Client',
    addressLine1: '789 Innovation Way',
    addressLine2: 'Research Valley, Phase 2',
    city: 'Hyderabad',
    state: 'Telangana',
    country: 'India',
    postalCode: '500081',
    latitude: 17.3850,
    longitude: 78.4867,
    radius: 100,
    timezone: 'Asia/Kolkata (GMT+5:30)',
    status: 'Inactive',
  },
];

function FormSectionHeader({ title, icon, colors }: { title: string; icon: string; colors: any }) {
  return (
    <View style={[styles.formSectionHeader, { borderBottomColor: colors.border }]}>
      <MaterialCommunityIcons name={icon as any} size={16} color={colors.brand} style={{ marginRight: 6 }} />
      <Text style={[styles.formSectionTitle, { color: colors.brand }]}>{title}</Text>
    </View>
  );
}

export default function AdminOfficeLocationScreen({ onNavigate, onBack }: AdminOfficeLocationScreenProps) {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const [search, setSearch] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);
  const [locations, setLocations] = useState<OfficeLocation[]>(DEFAULT_LOCATIONS);
  
  // Form screen visibility state
  const [showForm, setShowForm] = useState(false);
  const [editingLocation, setEditingLocation] = useState<OfficeLocation | null>(null);
  
  // Form fields
  const [formName, setFormName] = useState('');
  const [formOfficeType, setFormOfficeType] = useState<'HD' | 'Branch' | 'Client'>('HD');
  const [formAddressLine1, setFormAddressLine1] = useState('');
  const [formAddressLine2, setFormAddressLine2] = useState('');
  const [formCity, setFormCity] = useState('');
  const [formState, setFormState] = useState('');
  const [formCountry, setFormCountry] = useState('');
  const [formPostalCode, setFormPostalCode] = useState('');
  const [formLat, setFormLat] = useState('');
  const [formLng, setFormLng] = useState('');
  const [formRadius, setFormRadius] = useState('');
  const [formTimezone, setFormTimezone] = useState('');
  const [formStatus, setFormStatus] = useState<'Active' | 'Inactive'>('Active');

  const openAddModal = () => {
    setEditingLocation(null);
    setFormName('');
    setFormOfficeType('HD');
    setFormAddressLine1('');
    setFormAddressLine2('');
    setFormCity('');
    setFormState('');
    setFormCountry('');
    setFormPostalCode('');
    setFormLat('');
    setFormLng('');
    setFormRadius('150');
    setFormTimezone('Asia/Kolkata (GMT+5:30)');
    setFormStatus('Active');
    setShowForm(true);
  };

  const openEditModal = (loc: OfficeLocation) => {
    setEditingLocation(loc);
    setFormName(loc.name);
    setFormOfficeType(loc.officeType || 'HD');
    setFormAddressLine1(loc.addressLine1);
    setFormAddressLine2(loc.addressLine2 || '');
    setFormCity(loc.city);
    setFormState(loc.state);
    setFormCountry(loc.country);
    setFormPostalCode(loc.postalCode);
    setFormLat(loc.latitude.toString());
    setFormLng(loc.longitude.toString());
    setFormRadius(loc.radius.toString());
    setFormTimezone(loc.timezone || '');
    setFormStatus(loc.status);
    setShowForm(true);
  };

  const handleSave = () => {
    if (!formName.trim()) return Alert.alert('Validation Error', 'Please enter an office name.');
    if (!formAddressLine1.trim()) return Alert.alert('Validation Error', 'Please enter Address Line 1.');
    if (!formCity.trim()) return Alert.alert('Validation Error', 'Please enter a City.');
    if (!formState.trim()) return Alert.alert('Validation Error', 'Please enter a State.');
    if (!formCountry.trim()) return Alert.alert('Validation Error', 'Please enter a Country.');
    if (!formPostalCode.trim()) return Alert.alert('Validation Error', 'Please enter a Postal Code.');
    
    const latNum = parseFloat(formLat);
    if (isNaN(latNum) || latNum < -90 || latNum > 90) {
      return Alert.alert('Validation Error', 'Please enter a valid Latitude (-90 to 90).');
    }
    
    const lngNum = parseFloat(formLng);
    if (isNaN(lngNum) || lngNum < -180 || lngNum > 180) {
      return Alert.alert('Validation Error', 'Please enter a valid Longitude (-180 to 180).');
    }
    
    const radiusNum = parseInt(formRadius, 10);
    if (isNaN(radiusNum) || radiusNum <= 0) {
      return Alert.alert('Validation Error', 'Please enter a valid geofencing radius in meters (greater than 0).');
    }
    
    if (!formTimezone.trim()) return Alert.alert('Validation Error', 'Please enter or select a Time Zone.');

    if (editingLocation) {
      // Edit
      setLocations(prev =>
        prev.map(loc =>
          loc.id === editingLocation.id
            ? {
                ...loc,
                name: formName.trim(),
                officeType: formOfficeType,
                addressLine1: formAddressLine1.trim(),
                addressLine2: formAddressLine2.trim() || undefined,
                city: formCity.trim(),
                state: formState.trim(),
                country: formCountry.trim(),
                postalCode: formPostalCode.trim(),
                latitude: latNum,
                longitude: lngNum,
                radius: radiusNum,
                timezone: formTimezone.trim(),
                status: formStatus,
              }
            : loc
        )
      );
      Alert.alert('Success', 'Office location updated successfully.');
    } else {
      // Add
      const newLoc: OfficeLocation = {
        id: Math.random().toString(),
        name: formName.trim(),
        officeType: formOfficeType,
        addressLine1: formAddressLine1.trim(),
        addressLine2: formAddressLine2.trim() || undefined,
        city: formCity.trim(),
        state: formState.trim(),
        country: formCountry.trim(),
        postalCode: formPostalCode.trim(),
        latitude: latNum,
        longitude: lngNum,
        radius: radiusNum,
        timezone: formTimezone.trim(),
        status: formStatus,
      };
      setLocations(prev => [...prev, newLoc]);
      Alert.alert('Success', 'Office location added successfully.');
    }
    setShowForm(false);
  };

  const handleDelete = (id: string) => {
    Alert.alert(
      'Confirm Delete',
      'Are you sure you want to delete this office location?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            setLocations(prev => prev.filter(loc => loc.id !== id));
            Alert.alert('Success', 'Office location deleted successfully.');
          },
        },
      ]
    );
  };

  const filteredLocations = locations.filter(
    loc =>
      loc.name.toLowerCase().includes(search.toLowerCase()) ||
      loc.addressLine1.toLowerCase().includes(search.toLowerCase()) ||
      (loc.addressLine2 && loc.addressLine2.toLowerCase().includes(search.toLowerCase())) ||
      loc.city.toLowerCase().includes(search.toLowerCase()) ||
      loc.state.toLowerCase().includes(search.toLowerCase()) ||
      loc.country.toLowerCase().includes(search.toLowerCase()) ||
      loc.postalCode.toLowerCase().includes(search.toLowerCase())
  );

  const renderTypeBadge = (type: 'HD' | 'Branch' | 'Client') => {
    let bgColor = colors.brandBg;
    let textColor = colors.brand;
    let label = 'HD';
    if (type === 'Branch') {
      bgColor = '#F3E8FF';
      textColor = '#7C3AED';
      label = 'Branch';
      if (colors.statusBar === 'light-content') {
        bgColor = '#3B0764';
        textColor = '#C084FC';
      }
    } else if (type === 'Client') {
      bgColor = colors.amberBg;
      textColor = colors.amber;
      label = 'Client';
    }
    return (
      <View style={[styles.typeBadge, { backgroundColor: bgColor }]}>
        <Text style={[styles.typeBadgeText, { color: textColor }]}>{label}</Text>
      </View>
    );
  };

  if (showForm) {
    return (
      <View style={[styles.container, { backgroundColor: colors.bgScreen }]}>
        <StatusBar barStyle={colors.statusBar} backgroundColor={colors.header} />

        <AdminHeader
          title={editingLocation ? 'Edit Office Location' : 'Add Office Location'}
          showBackButton={true}
          onBackPress={() => setShowForm(false)}
        />

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[styles.formScrollContent, { paddingBottom: insets.bottom + 95 }]}
        >
          {/* Group 1: Office Info */}
          <FormSectionHeader title="Office Info" icon="information-outline" colors={colors} />
          
          <Text style={[styles.label, { color: colors.textPrimary }]}>Office Name *</Text>
          <TextInput
            style={[styles.input, { color: colors.textPrimary, borderColor: colors.border, backgroundColor: colors.bgScreen }]}
            placeholder="e.g. Headquarters"
            placeholderTextColor={colors.textSecond}
            value={formName}
            onChangeText={setFormName}
          />

          <Text style={[styles.label, { color: colors.textPrimary }]}>Office Type *</Text>
          <View style={styles.segmentedRow}>
            {(['HD', 'Branch', 'Client'] as const).map(type => {
              const isSelected = formOfficeType === type;
              let activeColor = colors.brand;
              if (type === 'Branch') activeColor = '#7C3AED';
              if (type === 'Client') activeColor = colors.amber;
              
              return (
                <TouchableOpacity
                  key={type}
                  style={[
                    styles.segmentedButton,
                    { borderColor: colors.border },
                    isSelected && { backgroundColor: activeColor, borderColor: activeColor }
                  ]}
                  onPress={() => setFormOfficeType(type)}
                >
                  <Text style={[styles.segmentedText, { color: colors.textPrimary }, isSelected && { color: '#FFFFFF' }]}>
                    {type}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <Text style={[styles.label, { color: colors.textPrimary }]}>Time Zone *</Text>
          <TextInput
            style={[styles.input, { color: colors.textPrimary, borderColor: colors.border, backgroundColor: colors.bgScreen }]}
            placeholder="e.g. Asia/Kolkata (GMT+5:30)"
            placeholderTextColor={colors.textSecond}
            value={formTimezone}
            onChangeText={setFormTimezone}
          />
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.timezonePillsContainer}>
            {[
              'Asia/Kolkata (GMT+5:30)',
              'UTC',
              'US/Eastern (EST)',
              'US/Pacific (PST)',
              'Europe/London (GMT)',
              'Asia/Singapore (SGT)',
              'Australia/Sydney (AEST)',
            ].map(tz => (
              <TouchableOpacity
                key={tz}
                style={[styles.tzPill, { backgroundColor: colors.bgScreen, borderColor: colors.border }]}
                onPress={() => setFormTimezone(tz)}
              >
                <Text style={[styles.tzPillText, { color: colors.textSecond }]}>{tz.split(' ')[0]}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Group 2: Address Details */}
          <FormSectionHeader title="Address Details" icon="map-marker-outline" colors={colors} />

          <Text style={[styles.label, { color: colors.textPrimary }]}>Address Line 1 *</Text>
          <TextInput
            style={[styles.input, { color: colors.textPrimary, borderColor: colors.border, backgroundColor: colors.bgScreen }]}
            placeholder="Building name, street, road"
            placeholderTextColor={colors.textSecond}
            value={formAddressLine1}
            onChangeText={setFormAddressLine1}
          />

          <Text style={[styles.label, { color: colors.textPrimary }]}>Address Line 2 (Optional)</Text>
          <TextInput
            style={[styles.input, { color: colors.textPrimary, borderColor: colors.border, backgroundColor: colors.bgScreen }]}
            placeholder="Suite, floor, landmark"
            placeholderTextColor={colors.textSecond}
            value={formAddressLine2}
            onChangeText={setFormAddressLine2}
          />

          <View style={styles.formRow}>
            <View style={styles.halfCol}>
              <Text style={[styles.label, { color: colors.textPrimary }]}>City *</Text>
              <TextInput
                style={[styles.input, { color: colors.textPrimary, borderColor: colors.border, backgroundColor: colors.bgScreen }]}
                placeholder="e.g. Bengaluru"
                placeholderTextColor={colors.textSecond}
                value={formCity}
                onChangeText={setFormCity}
              />
            </View>
            <View style={styles.halfCol}>
              <Text style={[styles.label, { color: colors.textPrimary }]}>State *</Text>
              <TextInput
                style={[styles.input, { color: colors.textPrimary, borderColor: colors.border, backgroundColor: colors.bgScreen }]}
                placeholder="e.g. Karnataka"
                placeholderTextColor={colors.textSecond}
                value={formState}
                onChangeText={setFormState}
              />
            </View>
          </View>

          <View style={styles.formRow}>
            <View style={styles.halfCol}>
              <Text style={[styles.label, { color: colors.textPrimary }]}>Country *</Text>
              <TextInput
                style={[styles.input, { color: colors.textPrimary, borderColor: colors.border, backgroundColor: colors.bgScreen }]}
                placeholder="e.g. India"
                placeholderTextColor={colors.textSecond}
                value={formCountry}
                onChangeText={setFormCountry}
              />
            </View>
            <View style={styles.halfCol}>
              <Text style={[styles.label, { color: colors.textPrimary }]}>Postal Code *</Text>
              <TextInput
                style={[styles.input, { color: colors.textPrimary, borderColor: colors.border, backgroundColor: colors.bgScreen }]}
                placeholder="e.g. 560001"
                placeholderTextColor={colors.textSecond}
                value={formPostalCode}
                onChangeText={setFormPostalCode}
              />
            </View>
          </View>

          {/* Group 3: Geofencing & Coordinates */}
          <FormSectionHeader title="Geofencing & Coordinates" icon="crosshairs-gps" colors={colors} />

          <View style={styles.formRow}>
            <View style={styles.halfCol}>
              <Text style={[styles.label, { color: colors.textPrimary }]}>Latitude *</Text>
              <TextInput
                style={[styles.input, { color: colors.textPrimary, borderColor: colors.border, backgroundColor: colors.bgScreen }]}
                placeholder="e.g. 12.9716"
                placeholderTextColor={colors.textSecond}
                keyboardType="numeric"
                value={formLat}
                onChangeText={setFormLat}
              />
            </View>
            <View style={styles.halfCol}>
              <Text style={[styles.label, { color: colors.textPrimary }]}>Longitude *</Text>
              <TextInput
                style={[styles.input, { color: colors.textPrimary, borderColor: colors.border, backgroundColor: colors.bgScreen }]}
                placeholder="e.g. 77.5946"
                placeholderTextColor={colors.textSecond}
                keyboardType="numeric"
                value={formLng}
                onChangeText={setFormLng}
              />
            </View>
          </View>

          <Text style={[styles.label, { color: colors.textPrimary }]}>Geofence Radius (meters) *</Text>
          <TextInput
            style={[styles.input, { color: colors.textPrimary, borderColor: colors.border, backgroundColor: colors.bgScreen }]}
            placeholder="e.g. 150"
            placeholderTextColor={colors.textSecond}
            keyboardType="number-pad"
            value={formRadius}
            onChangeText={setFormRadius}
          />

          {/* Group 4: Status */}
          <FormSectionHeader title="Status & Visibility" icon="toggle-switch-outline" colors={colors} />

          <Text style={[styles.label, { color: colors.textPrimary }]}>Status</Text>
          <View style={styles.statusSelectRow}>
            <TouchableOpacity
              style={[
                styles.statusSelectorOption,
                { borderColor: colors.border },
                formStatus === 'Active' && { backgroundColor: colors.success, borderColor: colors.success },
              ]}
              onPress={() => setFormStatus('Active')}
            >
              <Text style={[styles.statusSelectorText, { color: colors.textPrimary }, formStatus === 'Active' && { color: '#FFFFFF' }]}>
                Active
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.statusSelectorOption,
                { borderColor: colors.border },
                formStatus === 'Inactive' && { backgroundColor: colors.textSecond, borderColor: colors.textSecond },
              ]}
              onPress={() => setFormStatus('Inactive')}
            >
              <Text style={[styles.statusSelectorText, { color: colors.textPrimary }, formStatus === 'Inactive' && { color: '#FFFFFF' }]}>
                Inactive
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.formButtonContainer}>
            <TouchableOpacity
              style={[styles.formNoButton, { borderColor: colors.border, backgroundColor: colors.cardAlt }]}
              onPress={() => setShowForm(false)}
            >
              <Text style={{ color: colors.textSecond, fontWeight: '700' }}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.formYesButton, { backgroundColor: colors.brand }]} onPress={handleSave}>
              <Text style={{ color: '#FFFFFF', fontWeight: '700' }}>Save</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>

        <AdminBottomTabNavigator
          activeTab={null}
          onTabPress={tab => {
            if (tab === 'home') onNavigate?.('admin_dashboard');
            else onNavigate?.(`admin_${tab}`);
          }}
        />

        <AdminMenu visible={menuOpen} onClose={() => setMenuOpen(false)} onNavigate={onNavigate} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.bgScreen }]}>
      <StatusBar barStyle={colors.statusBar} backgroundColor={colors.header} />

      <AdminHeader
        title="Office Locations"
        onMenuPress={() => setMenuOpen(true)}
        onNotificationPress={() => onNavigate?.('admin_alerts')}
        onProfilePress={() => onNavigate?.('admin_profile')}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 95 }]}
      >
        <View style={styles.topInfoRow}>
          <Text style={[styles.pageDescription, { color: colors.textSecond }]}>
            Define office geofences to validate staff check-in locations.
          </Text>
          <TouchableOpacity
            style={[styles.addButton, { backgroundColor: colors.brand }]}
            activeOpacity={0.8}
            onPress={openAddModal}
          >
            <Feather name="plus" size={16} color="#FFFFFF" />
            <Text style={styles.addButtonText}>Add Location</Text>
          </TouchableOpacity>
        </View>

        {/* Search Bar */}
        <View style={[styles.searchContainer, { backgroundColor: colors.card, borderColor: colors.borderLight }]}>
          <Feather name="search" size={18} color={colors.textSecond} style={styles.searchIcon} />
          <TextInput
            style={[styles.searchInput, { color: colors.textPrimary }]}
            placeholder="Search locations by name or address..."
            placeholderTextColor={colors.textSecond}
            value={search}
            onChangeText={setSearch}
          />
        </View>

        <View style={[styles.divider, { backgroundColor: colors.border }]} />

        <Text style={[styles.sectionHeader, { color: colors.textSecond }]}>OFFICE GEOFENCES INDEX</Text>

        {/* Location List */}
        {filteredLocations.length === 0 ? (
          <Text style={{ textAlign: 'center', color: colors.textSecond, marginTop: 30 }}>
            No office locations found.
          </Text>
        ) : (
          filteredLocations.map(loc => {
            const formattedAddress = `${loc.addressLine1}${loc.addressLine2 ? ', ' + loc.addressLine2 : ''}, ${loc.city}, ${loc.state}, ${loc.country} - ${loc.postalCode}`;
            return (
              <View
                key={loc.id}
                style={[styles.locationCard, { backgroundColor: colors.card, borderColor: colors.borderLight }]}
              >
                <View style={styles.cardHeaderRow}>
                  <View style={styles.cardInfoRow}>
                    <View style={[styles.iconContainer, { backgroundColor: loc.status === 'Active' ? '#E0F2FE' : colors.iconBg }]}>
                      <MaterialCommunityIcons
                        name="office-building-marker"
                        size={24}
                        color={loc.status === 'Active' ? '#0284C7' : colors.textSecond}
                      />
                    </View>
                    <View style={{ flex: 1 }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 6, marginBottom: 4 }}>
                        <Text style={[styles.locationName, { color: colors.textPrimary, marginBottom: 0 }]}>{loc.name}</Text>
                        {renderTypeBadge(loc.officeType)}
                      </View>
                      <Text style={[styles.addressText, { color: colors.textSecond }]} numberOfLines={2}>
                        {formattedAddress}
                      </Text>
                    </View>
                  </View>
                </View>

                <View style={[styles.cardDivider, { backgroundColor: colors.borderLight }]} />

                <View style={styles.detailsRow}>
                  <View style={styles.detailCol}>
                    <Text style={[styles.detailLabel, { color: colors.textSecond }]}>Geofence Radius</Text>
                    <Text style={[styles.detailValue, { color: colors.textPrimary }]}>{loc.radius} meters</Text>
                  </View>
                  <View style={styles.detailCol}>
                    <Text style={[styles.detailLabel, { color: colors.textSecond }]}>Time Zone</Text>
                    <Text style={[styles.detailValue, { color: colors.textPrimary }]} numberOfLines={1}>{loc.timezone}</Text>
                  </View>
                  <View style={[styles.detailCol, { flex: 1.2 }]}>
                    <Text style={[styles.detailLabel, { color: colors.textSecond }]}>Coordinates</Text>
                    <Text style={[styles.detailValue, { color: colors.textPrimary }]}>
                      {loc.latitude.toFixed(4)}, {loc.longitude.toFixed(4)}
                    </Text>
                  </View>
                </View>

                <View style={[styles.actionRow, { borderTopColor: colors.borderLight }]}>
                  <View style={[styles.statusBadge, { backgroundColor: loc.status === 'Active' ? colors.successBg : colors.iconBg }]}>
                    <View style={[styles.statusDot, { backgroundColor: loc.status === 'Active' ? colors.success : colors.textSecond }]} />
                    <Text style={[styles.statusText, { color: loc.status === 'Active' ? colors.success : colors.textSecond }]}>
                      {loc.status}
                    </Text>
                  </View>
                  <View style={styles.actionButtons}>
                    <TouchableOpacity style={styles.iconBtn} onPress={() => openEditModal(loc)}>
                      <Feather name="edit-2" size={16} color={colors.brand} />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.iconBtn} onPress={() => handleDelete(loc.id)}>
                      <Feather name="trash-2" size={16} color={colors.danger} />
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            );
          })
        )}
      </ScrollView>

      <AdminBottomTabNavigator
        activeTab={null}
        onTabPress={tab => {
          if (tab === 'home') onNavigate?.('admin_dashboard');
          else onNavigate?.(`admin_${tab}`);
        }}
      />

      <AdminMenu visible={menuOpen} onClose={() => setMenuOpen(false)} onNavigate={onNavigate} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { paddingHorizontal: 16, paddingTop: 16 },
  topInfoRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16, gap: 12 },
  pageDescription: { flex: 1, fontSize: 14, lineHeight: 20 },
  addButton: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8, gap: 6 },
  addButtonText: { color: '#FFFFFF', fontWeight: '700', fontSize: 13 },
  searchContainer: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderRadius: 12, paddingHorizontal: 12, height: 48, marginBottom: 16 },
  searchIcon: { marginRight: 8 },
  searchInput: { flex: 1, fontSize: 14, paddingVertical: 8 },
  divider: { height: 1, marginBottom: 16 },
  sectionHeader: { fontSize: 12, fontWeight: '700', letterSpacing: 1.0, marginBottom: 12 },
  locationCard: { borderRadius: 16, borderWidth: 1, padding: 16, marginBottom: 14, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.02, shadowRadius: 6, elevation: 2 },
  cardHeaderRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  cardInfoRow: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
  iconContainer: { width: 44, height: 44, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  locationName: { fontSize: 16, fontWeight: '700', marginBottom: 4 },
  addressText: { fontSize: 13, lineHeight: 17 },
  cardDivider: { height: 1, marginVertical: 12 },
  detailsRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 12, marginBottom: 12 },
  detailCol: { flex: 1 },
  detailLabel: { fontSize: 11, fontWeight: '600', marginBottom: 4, textTransform: 'uppercase' },
  detailValue: { fontSize: 13, fontWeight: '700' },
  actionRow: { borderTopWidth: 1, paddingTop: 12, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  statusBadge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, gap: 6 },
  statusDot: { width: 6, height: 6, borderRadius: 3 },
  statusText: { fontSize: 12, fontWeight: '700' },
  actionButtons: { flexDirection: 'row', gap: 12 },
  iconBtn: { padding: 4 },
  
  typeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  typeBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
  },

  label: { fontSize: 13, fontWeight: '700', marginBottom: 6, marginTop: 12 },
  input: { height: 44, borderWidth: 1, borderRadius: 10, paddingHorizontal: 12, fontSize: 14 },
  row: { flexDirection: 'row' },
  statusSelectRow: { flexDirection: 'row', gap: 12, marginTop: 6 },
  statusSelectorOption: { flex: 1, height: 40, borderWidth: 1, borderRadius: 8, justifyContent: 'center', alignItems: 'center' },
  statusSelectorText: { fontWeight: '700', fontSize: 13 },
  
  formScrollContent: {
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  formButtonContainer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 32,
    marginBottom: 20,
  },
  formNoButton: {
    flex: 1,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
  },
  formYesButton: {
    flex: 1,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  formSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 18,
    marginBottom: 8,
    borderBottomWidth: 1,
    paddingBottom: 4,
  },
  formSectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  formRow: {
    flexDirection: 'row',
    gap: 12,
  },
  halfCol: {
    flex: 1,
  },
  segmentedRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 4,
  },
  segmentedButton: {
    flex: 1,
    height: 38,
    borderWidth: 1,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  segmentedText: {
    fontSize: 13,
    fontWeight: '700',
  },
  timezonePillsContainer: {
    gap: 8,
    paddingVertical: 6,
  },
  tzPill: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
  },
  tzPillText: {
    fontSize: 11,
    fontWeight: '600',
  },
});
