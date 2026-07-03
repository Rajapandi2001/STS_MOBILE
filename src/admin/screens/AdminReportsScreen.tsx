import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  Modal,
  Alert,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/context/ThemeContext';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Print from 'expo-print';
import AdminMenu from '@/admin/components/AdminMenu';

export interface AlertItem {
  id: string;
  title: string;
  message: string;
  time: string;
  type: 'warning' | 'critical' | 'info' | 'success';
  read: boolean;
  actionText?: string;
  linkText?: string;
}

interface AdminReportsScreenProps {
  onNavigate?: (screen: string, params?: any) => void;
  onBack?: () => void;
}

const STAFF_LIST = [
  { name: 'Sarah Jenkins', role: 'Senior Analyst', department: 'Engineering', status: 'Active' },
  { name: 'Michael Chen', role: 'Product Manager', department: 'Product', status: 'Active' },
  { name: 'David Rossi', role: 'Finance Director', department: 'Finance', status: 'Inactive' },
  { name: 'Amanda Patel', role: 'UX Designer', department: 'Design', status: 'Pending' },
  { name: 'Manikandan Rajan', role: 'Developer', department: 'Engineering', status: 'Active' },
  { name: 'Manish Sharma', role: 'QA Engineer', department: 'Quality Assurance', status: 'Active' },
  { name: 'Manoj Kumar', role: 'Lead Engineer', department: 'Engineering', status: 'Pending' },
];

const CLIENT_LIST = [
  { name: 'ACME Corporation', clientId: 'CLN-2026-901', email: 'info@acme.com', country: 'United States', status: 'Active' },
  { name: 'Nexus Global Tech', clientId: 'CLN-2026-443', email: 'contact@nexus.io', country: 'United Kingdom', status: 'Active' },
  { name: 'Starlight Ventures', clientId: 'CLN-2025-012', email: 'partnerships@star.co', country: 'Singapore', status: 'Inactive' },
  { name: 'Apex Innovations', clientId: 'CLN-2026-778', email: 'partnerships@apex.in', country: 'India', status: 'Pending' },
];

const PROJECT_LIST = [
  { name: 'Alpha Cloud Migration', projectId: 'PRJ-2026-001', startDate: '2026-01-15', endDate: '2026-06-30', status: 'Completed' },
  { name: 'Beta Fintech Portal', projectId: 'PRJ-2026-002', startDate: '2026-02-01', endDate: '2026-09-15', status: 'Active' },
  { name: 'Gamma Security Audit', projectId: 'PRJ-2026-003', startDate: '2026-03-10', endDate: '2026-05-20', status: 'Inactive' },
  { name: 'Delta Mobile Application', projectId: 'PRJ-2026-004', startDate: '2026-05-01', endDate: '2026-12-31', status: 'Pending' },
];

const HOLIDAY_LIST = [
  { id: 'HOL-2026-001', name: "New Year's Day", date: '2026-01-01', emoji: '🎉', status: 'Passed' },
  { id: 'HOL-2026-002', name: 'Good Friday', date: '2026-04-03', emoji: '🕊️', status: 'Passed' },
  { id: 'HOL-2026-003', name: 'Labor Day', date: '2026-05-01', emoji: '🛠️', status: 'Passed' },
  { id: 'HOL-2026-004', name: 'Christmas Day', date: '2026-12-25', emoji: '🎄', status: 'Active' },
];

export default function AdminReportsScreen({ onNavigate, onBack }: AdminReportsScreenProps) {
  const insets = useSafeAreaInsets();
  const { colors, isDark } = useTheme();
  const [menuOpen, setMenuOpen] = useState(false);
  const [selectedCard, setSelectedCard] = useState<'staff' | 'project' | 'holiday' | 'client'>('staff');

  // Inline Dropdown Toggle States
  const [deptDropdownOpen, setDeptDropdownOpen] = useState(false);
  const [staffDropdownOpen, setStaffDropdownOpen] = useState(false);
  const [clientDropdownOpen, setClientDropdownOpen] = useState(false);
  const [projectDropdownOpen, setProjectDropdownOpen] = useState(false);
  const [holidayDropdownOpen, setHolidayDropdownOpen] = useState(false);

  // Calendar Modal State
  const [dateModalOpen, setDateModalOpen] = useState(false);

  // Parameter Values
  const [startDate, setStartDate] = useState('YYYY-MM-DD');
  const [endDate, setEndDate] = useState('YYYY-MM-DD');
  const [tempStartDate, setTempStartDate] = useState<string | null>(null);
  const [tempEndDate, setTempEndDate] = useState<string | null>(null);

  const [selectedDept, setSelectedDept] = useState('Select Team / Department');
  const [selectedStaff, setSelectedStaff] = useState('Select Staff Full Name');
  const [selectedClient, setSelectedClient] = useState('All Clients');
  const [selectedProject, setSelectedProject] = useState('All Projects');
  const [selectedHoliday, setSelectedHoliday] = useState('All Holidays (Public & Custom)');

  const departments = ['Select Team / Department', 'Admin', 'HR', 'Employee', 'Manager', 'Director', 'All Teams'];

  const recentReports = [
    {
      id: '1',
      title: 'Q3 Client Performance Summary',
      time: 'Generated Oct 28, 09:41 AM',
      icon: 'file-document-outline',
      iconBg: isDark ? '#450A0A' : '#FEF2F2',
      iconColor: '#EF4444',
    },
    {
      id: '2',
      title: 'Oct Staff Attendance Log',
      time: 'Generated Oct 25, 14:20 PM',
      icon: 'table',
      iconBg: isDark ? '#052E16' : '#F0FDF4',
      iconColor: '#22C55E',
    },
    {
      id: '3',
      title: 'Holiday Calendar YTD',
      time: 'Generated Oct 15, 11:05 AM',
      icon: 'file-document-outline',
      iconBg: isDark ? '#450A0A' : '#FEF2F2',
      iconColor: '#EF4444',
    },
  ];

  // Card Tab Change Handler
  const handleCardChange = (card: 'staff' | 'project' | 'holiday' | 'client') => {
    setSelectedCard(card);
    setDeptDropdownOpen(false);
    setStaffDropdownOpen(false);
    setClientDropdownOpen(false);
    setProjectDropdownOpen(false);
    setHolidayDropdownOpen(false);
  };

  // Calendar Day Click Handler
  const handleDayPress = (dateStr: string) => {
    if (!tempStartDate || tempEndDate) {
      setTempStartDate(dateStr);
      setTempEndDate(null);
    } else {
      if (dateStr >= tempStartDate) {
        setTempEndDate(dateStr);
      } else {
        setTempStartDate(dateStr);
        setTempEndDate(null);
      }
    }
  };

  const handleConfirmDateRange = () => {
    if (tempStartDate && tempEndDate) {
      setStartDate(tempStartDate);
      setEndDate(tempEndDate);
    } else if (tempStartDate) {
      setStartDate(tempStartDate);
      setEndDate(tempStartDate);
    }
    setDateModalOpen(false);
  };

  // File Download/Sharing Handler
  const handleExport = async (format: 'pdf' | 'excel') => {
    try {
      const cardTitle = selectedCard.charAt(0).toUpperCase() + selectedCard.slice(1);
      const fileBaseName = `${cardTitle}_Report_${Date.now()}`;
      let tempFileUri = '';

      if (format === 'pdf') {
        let headersHTML = '';
        let rowsHTML = '';
        let titleName = '';
        let metaRows = '';

        if (selectedCard === 'staff') {
          titleName = 'Staff Report';
          headersHTML = `
            <th>Name</th>
            <th>Department</th>
            <th>Role</th>
            <th>Status</th>
          `;
          rowsHTML = STAFF_LIST.map(staff => `
            <tr>
              <td><strong>${staff.name}</strong></td>
              <td>${staff.department}</td>
              <td>${staff.role}</td>
              <td><span class="badge badge-${staff.status.toLowerCase()}">${staff.status}</span></td>
            </tr>
          `).join('');
          metaRows = `
            <tr>
              <td class="meta-label">Team / Department:</td>
              <td class="meta-value">${selectedDept}</td>
            </tr>
            <tr>
              <td class="meta-label">Staff Filter:</td>
              <td class="meta-value">${selectedStaff}</td>
            </tr>
          `;
        } else if (selectedCard === 'client') {
          titleName = 'Client Report';
          headersHTML = `
            <th>Client Name</th>
            <th>Client ID</th>
            <th>Email</th>
            <th>Country</th>
            <th>Status</th>
          `;
          rowsHTML = CLIENT_LIST.map(client => `
            <tr>
              <td><strong>${client.name}</strong></td>
              <td>${client.clientId}</td>
              <td>${client.email}</td>
              <td>${client.country}</td>
              <td><span class="badge badge-${client.status.toLowerCase()}">${client.status}</span></td>
            </tr>
          `).join('');
          metaRows = `
            <tr>
              <td class="meta-label">Client Selection:</td>
              <td class="meta-value">${selectedClient}</td>
            </tr>
          `;
        } else if (selectedCard === 'project') {
          titleName = 'Project Report';
          headersHTML = `
            <th>Project Name</th>
            <th>Project ID</th>
            <th>Start Date</th>
            <th>End Date</th>
            <th>Status</th>
          `;
          rowsHTML = PROJECT_LIST.map(proj => `
            <tr>
              <td><strong>${proj.name}</strong></td>
              <td>${proj.projectId}</td>
              <td>${proj.startDate}</td>
              <td>${proj.endDate}</td>
              <td><span class="badge badge-${proj.status.toLowerCase()}">${proj.status}</span></td>
            </tr>
          `).join('');
          metaRows = `
            <tr>
              <td class="meta-label">Project Selection:</td>
              <td class="meta-value">${selectedProject}</td>
            </tr>
          `;
        } else if (selectedCard === 'holiday') {
          titleName = 'Holiday Report';
          headersHTML = `
            <th>Holiday Name</th>
            <th>Date</th>
            <th>Emoji</th>
            <th>Status</th>
          `;
          rowsHTML = HOLIDAY_LIST.map(hol => `
            <tr>
              <td><strong>${hol.name}</strong></td>
              <td>${hol.date}</td>
              <td style="font-size: 16px;">${hol.emoji}</td>
              <td><span class="badge badge-${hol.status.toLowerCase()}">${hol.status}</span></td>
            </tr>
          `).join('');
          metaRows = `
            <tr>
              <td class="meta-label">Holiday Selection:</td>
              <td class="meta-value">${selectedHoliday}</td>
            </tr>
          `;
        }

        const htmlContent = `
          <html>
            <head>
              <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0, user-scalable=no" />
              <style>
                body {
                  font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
                  padding: 30px;
                  color: #333;
                }
                .header {
                  text-align: center;
                  border-bottom: 2px solid #0A52D6;
                  padding-bottom: 20px;
                  margin-bottom: 30px;
                }
                .logo {
                  font-size: 24px;
                  font-weight: bold;
                  color: #0A52D6;
                  text-transform: uppercase;
                  letter-spacing: 1px;
                }
                .title {
                  font-size: 20px;
                  margin-top: 10px;
                  color: #4A5568;
                }
                .meta-table {
                  width: 100%;
                  margin-bottom: 30px;
                  border-collapse: collapse;
                }
                .meta-table td {
                  padding: 6px 12px;
                  font-size: 14px;
                }
                .meta-label {
                  font-weight: bold;
                  color: #4A5568;
                  width: 30%;
                }
                .meta-value {
                  color: #2D3748;
                }
                .data-table {
                  width: 100%;
                  border-collapse: collapse;
                  margin-top: 20px;
                }
                .data-table th {
                  background-color: #F7FAFC;
                  border-bottom: 2px solid #E2E8F0;
                  color: #4A5568;
                  font-weight: bold;
                  text-align: left;
                  padding: 12px;
                  font-size: 14px;
                }
                .data-table td {
                  padding: 12px;
                  border-bottom: 1px solid #E2E8F0;
                  font-size: 13px;
                  color: #2D3748;
                }
                .badge {
                  padding: 4px 8px;
                  border-radius: 4px;
                  font-size: 11px;
                  font-weight: bold;
                  text-transform: uppercase;
                  display: inline-block;
                }
                .badge-active, .badge-completed, .badge-passed {
                  background-color: #DEF7EC;
                  color: #03543F;
                }
                .badge-inactive {
                  background-color: #FDE8E8;
                  color: #9B1C1C;
                }
                .badge-pending {
                  background-color: #FEF08A;
                  color: #713F12;
                }
                .footer {
                  margin-top: 50px;
                  text-align: center;
                  font-size: 12px;
                  color: #A0AEC0;
                  border-top: 1px solid #E2E8F0;
                  padding-top: 20px;
                }
              </style>
            </head>
            <body>
              <div class="header">
                <div class="logo">Smart Time Sheet</div>
                <div class="title">${titleName}</div>
              </div>
              
              <table class="meta-table">
                <tr>
                  <td class="meta-label">Date Range:</td>
                  <td class="meta-value">${startDate === 'YYYY-MM-DD' ? 'Not Selected' : `${startDate} to ${endDate}`}</td>
                </tr>
                ${metaRows}
                <tr>
                  <td class="meta-label">Generated On:</td>
                  <td class="meta-value">${new Date().toLocaleString()}</td>
                </tr>
              </table>
              
              <table class="data-table">
                <thead>
                  <tr>
                    ${headersHTML}
                  </tr>
                </thead>
                <tbody>
                  ${rowsHTML}
                </tbody>
              </table>
              
              <div class="footer">
                This report was generated automatically by the Smart Time Sheet Mobile Application.
              </div>
            </body>
          </html>
        `;

        const { uri } = await Print.printToFileAsync({ html: htmlContent });
        tempFileUri = uri;
      } else {
        let csvContent = '';
        if (selectedCard === 'staff') {
          csvContent = `Name,Department,Role,Status\n` + 
            STAFF_LIST.map(staff => `"${staff.name}","${staff.department}","${staff.role}","${staff.status}"`).join('\n') + '\n';
        } else if (selectedCard === 'client') {
          csvContent = `Client Name,Client ID,Email,Country,Status\n` +
            CLIENT_LIST.map(c => `"${c.name}","${c.clientId}","${c.email}","${c.country}","${c.status}"`).join('\n') + '\n';
        } else if (selectedCard === 'project') {
          csvContent = `Project Name,Project ID,Start Date,End Date,Status\n` +
            PROJECT_LIST.map(p => `"${p.name}","${p.projectId}","${p.startDate}","${p.endDate}","${p.status}"`).join('\n') + '\n';
        } else if (selectedCard === 'holiday') {
          csvContent = `Holiday Name,Date,Emoji,Status\n` +
            HOLIDAY_LIST.map(h => `"${h.name}","${h.date}","${h.emoji}","${h.status}"`).join('\n') + '\n';
        }
        
        const fileName = `${fileBaseName}.csv`;
        tempFileUri = `${FileSystem.documentDirectory}${fileName}`;
        await FileSystem.writeAsStringAsync(tempFileUri, csvContent, {
          encoding: FileSystem.EncodingType.UTF8,
        });
      }

      if (Platform.OS === 'android') {
        let directoryUri = await AsyncStorage.getItem('savedDownloadFolder');

        if (!directoryUri) {
          const permissions = await FileSystem.StorageAccessFramework.requestDirectoryPermissionsAsync();
          if (permissions.granted) {
            directoryUri = permissions.directoryUri;
            await AsyncStorage.setItem('savedDownloadFolder', directoryUri);
          } else {
            Alert.alert('Permission Required', 'Storage permission is needed to save the report.');
            return;
          }
        }

        if (directoryUri) {
          try {
            const mimeType = format === 'excel' ? 'text/csv' : 'application/pdf';
            const newUri = await FileSystem.StorageAccessFramework.createFileAsync(
              directoryUri,
              fileBaseName,
              mimeType
            );

            const base64 = await FileSystem.readAsStringAsync(tempFileUri, {
              encoding: FileSystem.EncodingType.Base64,
            });
            await FileSystem.writeAsStringAsync(newUri, base64, {
              encoding: FileSystem.EncodingType.Base64,
            });

            Alert.alert('Success', `Report downloaded successfully as ${format.toUpperCase()}!`);
          } catch (err) {
            await AsyncStorage.removeItem('savedDownloadFolder');
            Alert.alert('Error', 'Could not save to the previous folder. Please try again to select a new folder.');
          }
        }
      } else {
        if (await Sharing.isAvailableAsync()) {
          await Sharing.shareAsync(tempFileUri);
        } else {
          Alert.alert('File Saved', `Report successfully created at: ${tempFileUri}`);
        }
      }
    } catch (error) {
      console.error(error);
      Alert.alert('Export Failed', 'An error occurred while generating and saving the report.');
    }
  };

  // Calendar Modal Renderer
  const renderCalendarModal = () => {
    const totalDays = 31;
    const daysArray = Array.from({ length: totalDays }, (_, i) => i + 1);
    
    return (
      <Modal visible={dateModalOpen} transparent animationType="fade">
        <TouchableOpacity 
          style={[styles.modalBackdrop, { backgroundColor: colors.modalBackdrop }]} 
          activeOpacity={1} 
          onPress={() => setDateModalOpen(false)}
        >
          <TouchableOpacity activeOpacity={1} style={[styles.modalCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.modalHeaderTitle, { color: colors.textPrimary }]}>Select Date Range</Text>
            <Text style={[styles.calendarMonthHeader, { color: colors.textPrimary }]}>October 2023</Text>
            
            {/* Weekdays */}
            <View style={styles.weekdayRow}>
              {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => (
                <Text key={day} style={[styles.weekdayText, { color: colors.textSecond }]}>{day}</Text>
              ))}
            </View>
            
            {/* Days Grid */}
            <View style={styles.daysGrid}>
              {daysArray.map(day => {
                const dateStr = `2023-10-${day.toString().padStart(2, '0')}`;
                const isSelectedStart = tempStartDate === dateStr;
                const isSelectedEnd = tempEndDate === dateStr;
                const isSelected = isSelectedStart || isSelectedEnd;
                const inRange = tempStartDate && tempEndDate && dateStr > tempStartDate && dateStr < tempEndDate;
                
                return (
                  <TouchableOpacity
                    key={day}
                    style={[
                      styles.dayCell,
                      isSelectedStart && [styles.dayCellSelectedStart, { backgroundColor: colors.brand }],
                      isSelectedEnd && [styles.dayCellSelectedEnd, { backgroundColor: colors.brand }],
                      inRange && [styles.dayCellInRange, { backgroundColor: colors.brandBorder }],
                    ]}
                    onPress={() => handleDayPress(dateStr)}
                  >
                    <Text style={[
                      styles.dayText,
                      { color: isSelected ? '#FFFFFF' : inRange ? colors.brand : colors.textPrimary }
                    ]}>
                      {day}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
            
            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.modalCancelBtn} onPress={() => setDateModalOpen(false)}>
                <Text style={[styles.modalCancelBtnText, { color: colors.textSecond }]}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.modalConfirmBtn, { backgroundColor: colors.brand }]} 
                onPress={handleConfirmDateRange}
              >
                <Text style={styles.modalConfirmBtnText}>Confirm</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    );
  };

  const renderParameters = () => {
    switch (selectedCard) {
      case 'staff':
        return (
          <>
            {/* Date Range Selector */}
            <View style={styles.selectorContainer}>
              <Text style={[styles.selectorLabel, { color: colors.textSecond }]}>DATE RANGE</Text>
              <TouchableOpacity 
                style={[styles.dropdownSelector, { backgroundColor: colors.cardAlt, borderColor: colors.border }]} 
                activeOpacity={0.7}
                onPress={() => setDateModalOpen(true)}
              >
                <View style={styles.dropdownLeftCol}>
                  <Feather name="calendar" size={16} color={colors.textSecond} style={{ marginRight: 8 }} />
                  <Text style={[styles.dropdownText, { color: startDate === 'YYYY-MM-DD' ? colors.textSecond : colors.textPrimary }]}>
                    {startDate === 'YYYY-MM-DD' ? 'YYYY-MM-DD to YYYY-MM-DD' : `${startDate} to ${endDate}`}
                  </Text>
                </View>
                <MaterialCommunityIcons name="calendar-month-outline" size={18} color={colors.textSecond} />
              </TouchableOpacity>
            </View>

            {/* Team / Department Selector */}
            <View style={styles.selectorContainer}>
              <Text style={[styles.selectorLabel, { color: colors.textSecond }]}>TEAM / DEPARTMENT</Text>
              <TouchableOpacity 
                style={[
                  styles.dropdownSelector, 
                  { backgroundColor: colors.cardAlt, borderColor: colors.border },
                  deptDropdownOpen && { borderColor: colors.brand }
                ]} 
                activeOpacity={0.7}
                onPress={() => {
                  setDeptDropdownOpen(!deptDropdownOpen);
                  setStaffDropdownOpen(false);
                }}
              >
                <View style={styles.dropdownLeftCol}>
                  <Feather name="users" size={16} color={colors.textSecond} style={{ marginRight: 8 }} />
                  <Text style={[styles.dropdownText, { color: selectedDept === 'Select Team / Department' ? colors.textSecond : colors.textPrimary }]}>
                    {selectedDept}
                  </Text>
                </View>
                <Feather name={deptDropdownOpen ? 'chevron-up' : 'chevron-down'} size={16} color={colors.textSecond} />
              </TouchableOpacity>

              {/* Inline Dropdown Options */}
              {deptDropdownOpen && (
                <View style={[styles.dropdownMenu, { backgroundColor: colors.card, borderColor: colors.border }]}>
                  {departments.map((dept) => (
                    <TouchableOpacity 
                      key={dept} 
                      style={[
                        styles.dropdownOption, 
                        { borderBottomColor: colors.borderLight },
                        selectedDept === dept && { backgroundColor: colors.brandBg }
                      ]}
                      onPress={() => {
                        setSelectedDept(dept);
                        setDeptDropdownOpen(false);
                      }}
                      activeOpacity={0.7}
                    >
                      <Text style={[
                        styles.dropdownOptionText, 
                        { color: selectedDept === dept ? colors.brand : colors.textPrimary }
                      ]}>
                        {dept}
                      </Text>
                      {selectedDept === dept && <Feather name="check" size={14} color={colors.brand} />}
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>

            {/* Staff Name Selector */}
            <View style={styles.selectorContainer}>
              <Text style={[styles.selectorLabel, { color: colors.textSecond }]}>STAFF NAME</Text>
              <TouchableOpacity 
                style={[
                  styles.dropdownSelector, 
                  { backgroundColor: colors.cardAlt, borderColor: colors.border },
                  staffDropdownOpen && { borderColor: colors.brand }
                ]} 
                activeOpacity={0.7}
                onPress={() => {
                  setStaffDropdownOpen(!staffDropdownOpen);
                  setDeptDropdownOpen(false);
                }}
              >
                <View style={styles.dropdownLeftCol}>
                  <Feather name="user" size={16} color={colors.textSecond} style={{ marginRight: 8 }} />
                  <Text style={[styles.dropdownText, { color: selectedStaff === 'Select Staff Full Name' ? colors.textSecond : colors.textPrimary }]}>
                    {selectedStaff}
                  </Text>
                </View>
                <Feather name={staffDropdownOpen ? 'chevron-up' : 'chevron-down'} size={16} color={colors.textSecond} />
              </TouchableOpacity>

              {/* Inline Dropdown Options */}
              {staffDropdownOpen && (
                <View style={[styles.dropdownMenu, { backgroundColor: colors.card, borderColor: colors.border }]}>
                  {/* Select Staff Option */}
                  <TouchableOpacity 
                    style={[
                      styles.dropdownOption, 
                      { borderBottomColor: colors.borderLight },
                      selectedStaff === 'Select Staff Full Name' && { backgroundColor: colors.brandBg }
                    ]}
                    onPress={() => {
                      setSelectedStaff('Select Staff Full Name');
                      setStaffDropdownOpen(false);
                    }}
                    activeOpacity={0.7}
                  >
                    <Text style={[
                      styles.dropdownOptionText, 
                      { color: selectedStaff === 'Select Staff Full Name' ? colors.brand : colors.textPrimary }
                    ]}>
                      Select Staff Full Name
                    </Text>
                    {selectedStaff === 'Select Staff Full Name' && <Feather name="check" size={14} color={colors.brand} />}
                  </TouchableOpacity>

                  {/* Staff List Options */}
                  {STAFF_LIST.map((staff) => (
                    <TouchableOpacity 
                      key={staff.name} 
                      style={[
                        styles.dropdownOption, 
                        { borderBottomColor: colors.borderLight },
                        selectedStaff === staff.name && { backgroundColor: colors.brandBg }
                      ]}
                      onPress={() => {
                        setSelectedStaff(staff.name);
                        setStaffDropdownOpen(false);
                      }}
                      activeOpacity={0.7}
                    >
                      <Text style={[
                        styles.dropdownOptionText, 
                        { color: selectedStaff === staff.name ? colors.brand : colors.textPrimary }
                      ]}>
                        {staff.name}
                      </Text>
                      {selectedStaff === staff.name && <Feather name="check" size={14} color={colors.brand} />}
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>
          </>
        );

      case 'client':
        return (
          <>
            <View style={styles.selectorContainer}>
              <Text style={[styles.selectorLabel, { color: colors.textSecond }]}>DATE RANGE</Text>
              <TouchableOpacity 
                style={[styles.dropdownSelector, { backgroundColor: colors.cardAlt, borderColor: colors.border }]} 
                activeOpacity={0.7}
                onPress={() => setDateModalOpen(true)}
              >
                <View style={styles.dropdownLeftCol}>
                  <Feather name="calendar" size={16} color={colors.textSecond} style={{ marginRight: 8 }} />
                  <Text style={[styles.dropdownText, { color: startDate === 'YYYY-MM-DD' ? colors.textSecond : colors.textPrimary }]}>
                    {startDate === 'YYYY-MM-DD' ? 'YYYY-MM-DD to YYYY-MM-DD' : `${startDate} to ${endDate}`}
                  </Text>
                </View>
                <Feather name="chevron-down" size={16} color={colors.textSecond} />
              </TouchableOpacity>
            </View>

            <View style={styles.selectorContainer}>
              <Text style={[styles.selectorLabel, { color: colors.textSecond }]}>CLIENT NAME</Text>
              <TouchableOpacity 
                style={[
                  styles.dropdownSelector, 
                  { backgroundColor: colors.cardAlt, borderColor: colors.border },
                  clientDropdownOpen && { borderColor: colors.brand }
                ]} 
                activeOpacity={0.7}
                onPress={() => {
                  setClientDropdownOpen(!clientDropdownOpen);
                  setProjectDropdownOpen(false);
                  setHolidayDropdownOpen(false);
                  setDeptDropdownOpen(false);
                  setStaffDropdownOpen(false);
                }}
              >
                <View style={styles.dropdownLeftCol}>
                  <Feather name="briefcase" size={16} color={colors.textSecond} style={{ marginRight: 8 }} />
                  <Text style={[styles.dropdownText, { color: selectedClient === 'All Clients' ? colors.textSecond : colors.textPrimary }]}>
                    {selectedClient}
                  </Text>
                </View>
                <Feather name={clientDropdownOpen ? 'chevron-up' : 'chevron-down'} size={16} color={colors.textSecond} />
              </TouchableOpacity>

              {/* Inline Dropdown Options */}
              {clientDropdownOpen && (
                <View style={[styles.dropdownMenu, { backgroundColor: colors.card, borderColor: colors.border }]}>
                  {/* Select All Option */}
                  <TouchableOpacity 
                    style={[
                      styles.dropdownOption, 
                      { borderBottomColor: colors.borderLight },
                      selectedClient === 'All Clients' && { backgroundColor: colors.brandBg }
                    ]}
                    onPress={() => {
                      setSelectedClient('All Clients');
                      setClientDropdownOpen(false);
                    }}
                    activeOpacity={0.7}
                  >
                    <Text style={[
                      styles.dropdownOptionText, 
                      { color: selectedClient === 'All Clients' ? colors.brand : colors.textPrimary }
                    ]}>
                      All Clients
                    </Text>
                    {selectedClient === 'All Clients' && <Feather name="check" size={14} color={colors.brand} />}
                  </TouchableOpacity>

                  {/* Client List Options */}
                  {CLIENT_LIST.map((client) => (
                    <TouchableOpacity 
                      key={client.name} 
                      style={[
                        styles.dropdownOption, 
                        { borderBottomColor: colors.borderLight },
                        selectedClient === client.name && { backgroundColor: colors.brandBg }
                      ]}
                      onPress={() => {
                        setSelectedClient(client.name);
                        setClientDropdownOpen(false);
                      }}
                      activeOpacity={0.7}
                    >
                      <Text style={[
                        styles.dropdownOptionText, 
                        { color: selectedClient === client.name ? colors.brand : colors.textPrimary }
                      ]}>
                        {client.name}
                      </Text>
                      {selectedClient === client.name && <Feather name="check" size={14} color={colors.brand} />}
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>
          </>
        );

      case 'project':
        return (
          <>
            <View style={styles.selectorContainer}>
              <Text style={[styles.selectorLabel, { color: colors.textSecond }]}>DATE RANGE</Text>
              <TouchableOpacity 
                style={[styles.dropdownSelector, { backgroundColor: colors.cardAlt, borderColor: colors.border }]} 
                activeOpacity={0.7}
                onPress={() => setDateModalOpen(true)}
              >
                <View style={styles.dropdownLeftCol}>
                  <Feather name="calendar" size={16} color={colors.textSecond} style={{ marginRight: 8 }} />
                  <Text style={[styles.dropdownText, { color: startDate === 'YYYY-MM-DD' ? colors.textSecond : colors.textPrimary }]}>
                    {startDate === 'YYYY-MM-DD' ? 'YYYY-MM-DD to YYYY-MM-DD' : `${startDate} to ${endDate}`}
                  </Text>
                </View>
                <Feather name="chevron-down" size={16} color={colors.textSecond} />
              </TouchableOpacity>
            </View>

            <View style={styles.selectorContainer}>
              <Text style={[styles.selectorLabel, { color: colors.textSecond }]}>PROJECT</Text>
              <TouchableOpacity 
                style={[
                  styles.dropdownSelector, 
                  { backgroundColor: colors.cardAlt, borderColor: colors.border },
                  projectDropdownOpen && { borderColor: colors.brand }
                ]} 
                activeOpacity={0.7}
                onPress={() => {
                  setProjectDropdownOpen(!projectDropdownOpen);
                  setClientDropdownOpen(false);
                  setHolidayDropdownOpen(false);
                  setDeptDropdownOpen(false);
                  setStaffDropdownOpen(false);
                }}
              >
                <View style={styles.dropdownLeftCol}>
                  <Feather name="folder" size={16} color={colors.textSecond} style={{ marginRight: 8 }} />
                  <Text style={[styles.dropdownText, { color: selectedProject === 'All Projects' ? colors.textSecond : colors.textPrimary }]}>
                    {selectedProject}
                  </Text>
                </View>
                <Feather name={projectDropdownOpen ? 'chevron-up' : 'chevron-down'} size={16} color={colors.textSecond} />
              </TouchableOpacity>

              {/* Inline Dropdown Options */}
              {projectDropdownOpen && (
                <View style={[styles.dropdownMenu, { backgroundColor: colors.card, borderColor: colors.border }]}>
                  {/* Select All Option */}
                  <TouchableOpacity 
                    style={[
                      styles.dropdownOption, 
                      { borderBottomColor: colors.borderLight },
                      selectedProject === 'All Projects' && { backgroundColor: colors.brandBg }
                    ]}
                    onPress={() => {
                      setSelectedProject('All Projects');
                      setProjectDropdownOpen(false);
                    }}
                    activeOpacity={0.7}
                  >
                    <Text style={[
                      styles.dropdownOptionText, 
                      { color: selectedProject === 'All Projects' ? colors.brand : colors.textPrimary }
                    ]}>
                      All Projects
                    </Text>
                    {selectedProject === 'All Projects' && <Feather name="check" size={14} color={colors.brand} />}
                  </TouchableOpacity>

                  {/* Project List Options */}
                  {PROJECT_LIST.map((proj) => (
                    <TouchableOpacity 
                      key={proj.name} 
                      style={[
                        styles.dropdownOption, 
                        { borderBottomColor: colors.borderLight },
                        selectedProject === proj.name && { backgroundColor: colors.brandBg }
                      ]}
                      onPress={() => {
                        setSelectedProject(proj.name);
                        setProjectDropdownOpen(false);
                      }}
                      activeOpacity={0.7}
                    >
                      <Text style={[
                        styles.dropdownOptionText, 
                        { color: selectedProject === proj.name ? colors.brand : colors.textPrimary }
                      ]}>
                        {proj.name}
                      </Text>
                      {selectedProject === proj.name && <Feather name="check" size={14} color={colors.brand} />}
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>
          </>
        );

      case 'holiday':
        return (
          <>
            <View style={styles.selectorContainer}>
              <Text style={[styles.selectorLabel, { color: colors.textSecond }]}>DATE RANGE</Text>
              <TouchableOpacity 
                style={[styles.dropdownSelector, { backgroundColor: colors.cardAlt, borderColor: colors.border }]} 
                activeOpacity={0.7}
                onPress={() => setDateModalOpen(true)}
              >
                <View style={styles.dropdownLeftCol}>
                  <Feather name="calendar" size={16} color={colors.textSecond} style={{ marginRight: 8 }} />
                  <Text style={[styles.dropdownText, { color: startDate === 'YYYY-MM-DD' ? colors.textSecond : colors.textPrimary }]}>
                    {startDate === 'YYYY-MM-DD' ? 'YYYY-MM-DD to YYYY-MM-DD' : `${startDate} to ${endDate}`}
                  </Text>
                </View>
                <Feather name="chevron-down" size={16} color={colors.textSecond} />
              </TouchableOpacity>
            </View>

            <View style={styles.selectorContainer}>
              <Text style={[styles.selectorLabel, { color: colors.textSecond }]}>HOLIDAY TYPE</Text>
              <TouchableOpacity 
                style={[
                  styles.dropdownSelector, 
                  { backgroundColor: colors.cardAlt, borderColor: colors.border },
                  holidayDropdownOpen && { borderColor: colors.brand }
                ]} 
                activeOpacity={0.7}
                onPress={() => {
                  setHolidayDropdownOpen(!holidayDropdownOpen);
                  setClientDropdownOpen(false);
                  setProjectDropdownOpen(false);
                  setDeptDropdownOpen(false);
                  setStaffDropdownOpen(false);
                }}
              >
                <View style={styles.dropdownLeftCol}>
                  <Feather name="sun" size={16} color={colors.textSecond} style={{ marginRight: 8 }} />
                  <Text style={[styles.dropdownText, { color: selectedHoliday === 'All Holidays (Public & Custom)' ? colors.textSecond : colors.textPrimary }]}>
                    {selectedHoliday}
                  </Text>
                </View>
                <Feather name={holidayDropdownOpen ? 'chevron-up' : 'chevron-down'} size={16} color={colors.textSecond} />
              </TouchableOpacity>

              {/* Inline Dropdown Options */}
              {holidayDropdownOpen && (
                <View style={[styles.dropdownMenu, { backgroundColor: colors.card, borderColor: colors.border }]}>
                  {/* Select All Option */}
                  <TouchableOpacity 
                    style={[
                      styles.dropdownOption, 
                      { borderBottomColor: colors.borderLight },
                      selectedHoliday === 'All Holidays (Public & Custom)' && { backgroundColor: colors.brandBg }
                    ]}
                    onPress={() => {
                      setSelectedHoliday('All Holidays (Public & Custom)');
                      setHolidayDropdownOpen(false);
                    }}
                    activeOpacity={0.7}
                  >
                    <Text style={[
                      styles.dropdownOptionText, 
                      { color: selectedHoliday === 'All Holidays (Public & Custom)' ? colors.brand : colors.textPrimary }
                    ]}>
                      All Holidays (Public & Custom)
                    </Text>
                    {selectedHoliday === 'All Holidays (Public & Custom)' && <Feather name="check" size={14} color={colors.brand} />}
                  </TouchableOpacity>

                  {/* Holiday List Options */}
                  {HOLIDAY_LIST.map((hol) => (
                    <TouchableOpacity 
                      key={hol.name} 
                      style={[
                        styles.dropdownOption, 
                        { borderBottomColor: colors.borderLight },
                        selectedHoliday === hol.name && { backgroundColor: colors.brandBg }
                      ]}
                      onPress={() => {
                        setSelectedHoliday(hol.name);
                        setHolidayDropdownOpen(false);
                      }}
                      activeOpacity={0.7}
                    >
                      <Text style={[
                        styles.dropdownOptionText, 
                        { color: selectedHoliday === hol.name ? colors.brand : colors.textPrimary }
                      ]}>
                        {hol.name}
                      </Text>
                      {selectedHoliday === hol.name && <Feather name="check" size={14} color={colors.brand} />}
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>
          </>
        );
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top, backgroundColor: colors.bgScreen }]}>
      <StatusBar barStyle={colors.statusBar} backgroundColor={colors.header} />

      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.header, borderBottomColor: colors.border }]}>
        <TouchableOpacity
          style={[styles.hamburgerBtn, { backgroundColor: colors.cardAlt }]}
          onPress={() => setMenuOpen(true)}
          activeOpacity={0.7}
        >
          <View style={[styles.hamburgerLine, { backgroundColor: colors.brand }]} />
          <View style={[styles.hamburgerLine, { width: 16, backgroundColor: colors.brand }]} />
          <View style={[styles.hamburgerLine, { backgroundColor: colors.brand }]} />
        </TouchableOpacity>

        <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>Reports Hub</Text>

        <TouchableOpacity
          style={[styles.avatarCircle, { backgroundColor: colors.brandBorder }]}
          activeOpacity={0.8}
          onPress={() => onNavigate?.('admin_profile', { source: 'header' })}
        >
          <Feather name="user" size={20} color={colors.brand} />
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 90 }]}
      >
        {/* Page Title & Description */}
        <View style={styles.pageHeaderContainer}>
          <Text style={[styles.pageTitle, { color: colors.textPrimary }]}>Reports Hub</Text>
          <Text style={[styles.pageDescription, { color: colors.textSecond }]}>
            Generate and manage team performance and operational reports.
          </Text>
        </View>

        {/* 2x2 Grid of Cards (Reordered: Staff, Client, Project, Holiday) */}
        <View style={styles.gridContainer}>
          {/* Card 1: Staff */}
          <TouchableOpacity
            style={[
              styles.gridCard,
              { backgroundColor: colors.card, borderColor: selectedCard === 'staff' ? colors.brand : colors.borderLight },
              selectedCard === 'staff' && styles.activeGridCard
            ]}
            onPress={() => handleCardChange('staff')}
            activeOpacity={0.8}
          >
            <View style={[styles.cardIconCircle, { backgroundColor: isDark ? '#1E3A5F' : '#EFF6FF' }]}>
              <MaterialCommunityIcons name="account-group" size={22} color={colors.brand} />
            </View>
            <Text style={[styles.cardTitle, { color: selectedCard === 'staff' ? colors.brand : colors.textPrimary }]}>
              Staff
            </Text>
            <Text style={[styles.cardSubtitle, { color: colors.textSecond }]}>
              Profiles & Directory
            </Text>
          </TouchableOpacity>

          {/* Card 2: Client */}
          <TouchableOpacity
            style={[
              styles.gridCard,
              { backgroundColor: colors.card, borderColor: selectedCard === 'client' ? colors.brand : colors.borderLight },
              selectedCard === 'client' && styles.activeGridCard
            ]}
            onPress={() => handleCardChange('client')}
            activeOpacity={0.8}
          >
            <View style={[styles.cardIconCircle, { backgroundColor: isDark ? '#1E3A5F' : '#EFF6FF' }]}>
              <MaterialCommunityIcons name="account-tie" size={22} color={colors.brand} />
            </View>
            <Text style={[styles.cardTitle, { color: selectedCard === 'client' ? colors.brand : colors.textPrimary }]}>
              Client
            </Text>
            <Text style={[styles.cardSubtitle, { color: colors.textSecond }]}>
              Management & Details
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.gridContainer}>
          {/* Card 3: Project */}
          <TouchableOpacity
            style={[
              styles.gridCard,
              { backgroundColor: colors.card, borderColor: selectedCard === 'project' ? colors.brand : colors.borderLight },
              selectedCard === 'project' && styles.activeGridCard
            ]}
            onPress={() => handleCardChange('project')}
            activeOpacity={0.8}
          >
            <View style={[styles.cardIconCircle, { backgroundColor: isDark ? '#422006' : '#FFFBEB' }]}>
              <MaterialCommunityIcons name="briefcase-outline" size={22} color={colors.amber} />
            </View>
            <Text style={[styles.cardTitle, { color: selectedCard === 'project' ? colors.brand : colors.textPrimary }]}>
              Project
            </Text>
            <Text style={[styles.cardSubtitle, { color: colors.textSecond }]}>
              Track Projects & Tasks
            </Text>
          </TouchableOpacity>

          {/* Card 4: Holiday */}
          <TouchableOpacity
            style={[
              styles.gridCard,
              { backgroundColor: colors.card, borderColor: selectedCard === 'holiday' ? colors.brand : colors.borderLight },
              selectedCard === 'holiday' && styles.activeGridCard
            ]}
            onPress={() => handleCardChange('holiday')}
            activeOpacity={0.8}
          >
            <View style={[styles.cardIconCircle, { backgroundColor: isDark ? '#450A0A' : '#FEF2F2' }]}>
              <MaterialCommunityIcons name="beach" size={22} color={colors.danger} />
            </View>
            <Text style={[styles.cardTitle, { color: selectedCard === 'holiday' ? colors.brand : colors.textPrimary }]}>
              Holiday
            </Text>
            <Text style={[styles.cardSubtitle, { color: colors.textSecond }]}>
              Calendar & Events
            </Text>
          </TouchableOpacity>
        </View>

        {/* Report Parameters Section */}
        <View style={[styles.sectionCard, { backgroundColor: colors.card, borderColor: colors.borderLight }]}>
          <Text style={[styles.sectionHeader, { color: colors.textPrimary }]}>REPORT PARAMETERS</Text>
          <View style={[styles.horizontalDivider, { backgroundColor: colors.borderLight }]} />

          {/* Dynamic selectors based on selectedCard */}
          {renderParameters()}

          <View style={{ height: 16 }} />

          {/* Export Buttons (EXPORT PDF First, EXPORT EXCEL Second) */}
          <TouchableOpacity 
            style={[styles.exportBtnFilled, { backgroundColor: colors.textPrimary }]} 
            activeOpacity={0.7}
            onPress={() => handleExport('pdf')}
          >
            <MaterialCommunityIcons name="file-pdf-box" size={18} color={colors.card} style={{ marginRight: 8 }} />
            <Text style={[styles.exportBtnFilledText, { color: colors.card }]}>EXPORT PDF</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.exportBtnDashed, { borderColor: colors.textPrimary, backgroundColor: 'transparent' }]} 
            activeOpacity={0.7}
            onPress={() => handleExport('excel')}
          >
            <MaterialCommunityIcons name="file-excel" size={18} color={colors.textPrimary} style={{ marginRight: 8 }} />
            <Text style={[styles.exportBtnDashedText, { color: colors.textPrimary }]}>EXPORT EXCEL</Text>
          </TouchableOpacity>
        </View>

        {/* Recent Reports Section */}
        <View style={[styles.sectionCard, { backgroundColor: colors.card, borderColor: colors.borderLight }]}>
          <View style={styles.recentReportsHeaderRow}>
            <Text style={[styles.sectionHeader, { color: colors.textPrimary }]}>Recent Reports</Text>
            <TouchableOpacity>
              <Text style={[styles.viewAllLink, { color: colors.brand }]}>View All</Text>
            </TouchableOpacity>
          </View>
          <View style={[styles.horizontalDivider, { backgroundColor: colors.borderLight }]} />

          {/* Reports List */}
          {recentReports.map((report) => (
            <TouchableOpacity key={report.id} style={styles.reportItemRow} activeOpacity={0.7}>
              <View style={[styles.reportIconContainer, { backgroundColor: report.iconBg }]}>
                <MaterialCommunityIcons name={report.icon as any} size={20} color={report.iconColor} />
              </View>
              <View style={styles.reportTextContainer}>
                <Text style={[styles.reportItemTitle, { color: colors.textPrimary }]}>{report.title}</Text>
                <Text style={[styles.reportItemTime, { color: colors.textMuted }]}>{report.time}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      {/* Bottom Tab Bar */}
      <View style={[styles.bottomTabBar, { paddingBottom: Math.max(insets.bottom, 12), backgroundColor: colors.tabBar, borderTopColor: colors.borderLight }]}>
        <TouchableOpacity style={styles.tabItem} onPress={() => onNavigate?.('admin_dashboard')}>
          <Feather name="home" size={22} color={colors.tabInactive} />
          <Text style={[styles.tabText, { color: colors.tabInactive }]}>Home</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.tabItem} onPress={() => onNavigate?.('admin_staff', { source: 'dashboard' })}>
          <MaterialCommunityIcons name="account-group-outline" size={24} color={colors.tabInactive} />
          <Text style={[styles.tabText, { color: colors.tabInactive }]}>Staff</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.tabItem}>
          <Feather name="bar-chart-2" size={22} color={colors.brand} />
          <Text style={[styles.tabText, { color: colors.brand }]}>Reports</Text>
        </TouchableOpacity>
      </View>

      <AdminMenu
        visible={menuOpen}
        onClose={() => setMenuOpen(false)}
        onNavigate={onNavigate}
      />

      {/* Selector Modals */}
      {renderCalendarModal()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
  },
  hamburgerBtn: {
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 5,
    borderRadius: 10,
    paddingHorizontal: 8
  },
  hamburgerLine: {
    width: 20,
    height: 2,
    borderRadius: 2
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  avatarCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 24,
  },
  pageHeaderContainer: {
    marginBottom: 24,
  },
  pageTitle: {
    fontSize: 26,
    fontWeight: '800',
    marginBottom: 6,
  },
  pageDescription: {
    fontSize: 14,
    lineHeight: 20,
  },
  gridContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
    gap: 16,
  },
  gridCard: {
    flex: 1,
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    alignItems: 'flex-start',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.02,
    shadowRadius: 6,
    elevation: 1,
  },
  activeGridCard: {
    borderWidth: 2,
    shadowOpacity: 0.05,
    shadowRadius: 8,
  },
  cardIconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 14,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: 12,
    fontWeight: '500',
  },
  sectionCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.02,
    shadowRadius: 6,
    elevation: 1,
  },
  sectionHeader: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 12,
  },
  horizontalDivider: {
    height: 1,
    marginBottom: 16,
  },
  selectorContainer: {
    marginBottom: 16,
    position: 'relative',
  },
  selectorLabel: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 8,
  },
  dropdownSelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    height: 48,
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 14,
  },
  dropdownLeftCol: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dropdownText: {
    fontSize: 14,
    fontWeight: '500',
  },
  dropdownMenu: {
    borderRadius: 8,
    borderWidth: 1,
    marginTop: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 4,
    overflow: 'hidden',
  },
  dropdownOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  dropdownOptionText: {
    fontSize: 14,
    fontWeight: '600',
  },
  exportBtnFilled: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    height: 46,
    borderRadius: 8,
    marginBottom: 12,
  },
  exportBtnFilledText: {
    fontSize: 14,
    fontWeight: '700',
  },
  exportBtnDashed: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    height: 46,
    borderRadius: 8,
    borderWidth: 1.5,
    borderStyle: 'dashed',
  },
  exportBtnDashedText: {
    fontSize: 14,
    fontWeight: '700',
  },
  recentReportsHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  viewAllLink: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 12,
  },
  reportItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  reportIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  reportTextContainer: {
    flex: 1,
  },
  reportItemTitle: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 2,
  },
  reportItemTime: {
    fontSize: 12,
    fontWeight: '500',
  },
  bottomTabBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.03,
    shadowRadius: 10,
    elevation: 10,
  },
  tabItem: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabText: {
    fontSize: 11,
    marginTop: 4,
    fontWeight: '500',
  },
  modalBackdrop: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalCard: {
    width: '100%',
    borderRadius: 16,
    borderWidth: 1,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  modalHeaderTitle: {
    fontSize: 18,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 16,
  },
  calendarMonthHeader: {
    fontSize: 16,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 12,
  },
  weekdayRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 8,
  },
  weekdayText: {
    fontSize: 12,
    fontWeight: '700',
    width: 32,
    textAlign: 'center',
  },
  daysGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
    marginBottom: 20,
  },
  dayCell: {
    width: '14.28%',
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 2,
    borderRadius: 20,
  },
  dayCellSelectedStart: {
    borderTopLeftRadius: 20,
    borderBottomLeftRadius: 20,
  },
  dayCellSelectedEnd: {
    borderTopRightRadius: 20,
    borderBottomRightRadius: 20,
  },
  dayCellInRange: {
    borderRadius: 0,
  },
  dayText: {
    fontSize: 14,
    fontWeight: '600',
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
  },
  modalCancelBtn: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  modalCancelBtnText: {
    fontSize: 14,
    fontWeight: '700',
  },
  modalConfirmBtn: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  modalConfirmBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
});