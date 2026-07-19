
const XLSX = require('xlsx');
const path = require('path');
const fs = require('fs');

// Data designed to match likely database values (Grade 7/8, Section A/B)
const students = [
    {
        "اسم الطالب": "أحمد محمد سالم",
        "رقم التلفون": "0501234567",
        "الصف": "الصف السابع",
        "الشعبة": "شعبة أ"
    },
    {
        "اسم الطالب": "سارة خالد العلي",
        "رقم التلفون": "0509876543",
        "الصف": "الصف السابع",
        "الشعبة": "شعبة ب"
    },
    {
        "اسم الطالب": "عمر يوسف حسن",
        "رقم التلفون": "0555555555",
        "الصف": "الصف الثامن",
        "الشعبة": "شعبة أ"
    },
    {
        "اسم الطالب": "ليلى محمود طه",
        "رقم التلفون": "0566666666",
        "الصف": "الصف الثامن",
        "الشعبة": "شعبة ب"
    },
    {
        "اسم الطالب": "خالد عبد الرحمن",
        "رقم التلفون": "0544444444",
        "الصف": "الصف السابع",
        "الشعبة": "شعبة ج"
    }
];

try {
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(students);

    // Auto-adjust column widths (approximation)
    const wscols = [
        { wch: 20 }, // name
        { wch: 15 }, // phone
        { wch: 15 }, // grade
        { wch: 10 }  // section
    ];
    ws['!cols'] = wscols;

    XLSX.utils.book_append_sheet(wb, ws, "Students");

    // Save to the Desktop so the user can find it easily
    const userProfile = process.env.USERPROFILE || process.env.HOME;
    const outputPath = path.join(userProfile, 'Desktop', 'students_import_template.xlsx');

    XLSX.writeFile(wb, outputPath);
    console.log(`Successfully created file at: ${outputPath}`);
} catch (error) {
    console.error("Error creating Excel file:", error);
    process.exit(1);
}
