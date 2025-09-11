export interface TeamMember {
  id: string;
  name: string;
  department: string;
  designation: string;
  dob: string;
  sex: string;
  blood: string;
  joining: string;
  phone: string;
  email: string;
  photo: string;
}

export const teamMembers: TeamMember[] = [
  {
    id: "WTE-MS-1773",
    name: "Md. Sazzadur Rahman",
    department: "Marketing",
    designation: "Sales Executive",
    dob: "29 Dec 2002",
    sex: "Male",
    blood: "A+",
    joining: "01 Jul 2025",
    phone: "+880 1726-101773",
    email: "Kazisazzad47@gmail.com",
    photo: `/our-teams/WTE-MS-1773.jpg`,
  },
  {
    id: "WTE-KH-5457",
    name: "Khalid Hosen Rusan",
    department: "Marketing",
    designation: "Sales Executive",
    dob: "18 Sep 2001",
    sex: "Male",
    blood: "B+",
    joining: "01 Aug 2025",
    phone: "+880 1888-045457",
    email: "khalidrusan285@gmail.com",
    photo: `/our-teams/WTE-KH-5457.jpg`,
  },
  {
    id: "WTE-MH-0847",
    name: "Maruf Hossain Mollik",
    department: "Marketing",
    designation: "Sales Executive",
    dob: "01 Mar 2003",
    sex: "Male",
    blood: "O+",
    joining: "01 Aug 2025",
    phone: "+880 1734-480847",
    email: "marufmollik51@gmail.com",
    photo: `/our-teams/WTE-MH-0847.jpg`,
  },
  {
    id: "WTE-SA-3982",
    name: "Sadia Afrin",
    department: "Customer Service",
    designation: "Customer Support Representatives",
    dob: "10 Aug 2003",
    sex: "Female",
    blood: "B+",
    joining: "01 Jul 2025",
    phone: "+880 1309-813982",
    email: "contact2sadia.afrin@gmail.com",
    photo: `/our-teams/WTE-SA-3982.jpg`,
  },
  {
    id: "WTE-YA-9040",
    name: "Yeamim Akter",
    department: "Marketing",
    designation: "Sales Executive",
    dob: "02 Sep 2003",
    sex: "Female",
    blood: "O+",
    joining: "01 Aug 2025",
    phone: "+880 1940-109040",
    email: "yeamim163@gmail.com",
    photo: `/our-teams/WTE-YA-9040.jpg`,
  },
  {
    id: "WTE-SI-1493",
    name: "Shariful Islam",
    department: "Customer Service",
    designation: "Customer Support Representatives",
    dob: "21 Feb 2005",
    sex: "Male",
    blood: "AB+",
    joining: "01 Jul 2025",
    phone: "+880 1618-001493",
    email: "wmt.sharifulislam@gmail.com",
    photo: `/our-teams/WTE-SI-1493.jpg`,
  },
  {
    id: "WTE-MN-3102",
    name: "Md. Naim",
    department: "Marketing",
    designation: "Sales Executive",
    dob: "01 Dec 2002",
    sex: "Male",
    blood: "O+",
    joining: "01 Jul 2025",
    phone: "+880 1316-603102",
    email: "rnnaimislam8@gmail.com",
    photo: `/our-teams/WTE-MN-3102.jpg`,
  },
  {
    id: "WTE-RI-3241",
    name: "Rafijul Islam Rupes",
    department: "Marketing",
    designation: "Sales Executive",
    dob: "18 Jul 2004",
    sex: "Male",
    blood: "B+",
    joining: "01 Aug 2025",
    phone: "+880 1622-623241",
    email: "wmt.rafijulrupes@gmail.com",
    photo: `/our-teams/WTE-RI-3241.jpg`,
  },
  {
    id: "WTE-NZ-0667",
    name: "MD Nuruzzaman Razon",
    department: "Marketing",
    designation: "Sales Executive",
    dob: "06 Nov 2004",
    sex: "Male",
    blood: "O+",
    joining: "01 Jul 2025",
    phone: "+880 1893-180667",
    email: "mdnuruzzamanrazon@gmail.com",
    photo: `/our-teams/WTE-NZ-0667.jpg`,
  },
  {
    id: "WTE-MS-5206",
    name: "Md Saiful Islam",
    department: "Administration",
    designation: "Director",
    dob: "23 Dec 2003",
    sex: "Male",
    blood: "O+",
    joining: "01 Jul 2025",
    phone: "+880 1739-585206",
    email: "saiful.islam@wetraineducation.com",
    photo: `/our-teams/WTE-MS-5206.jpg`,
  },
  {
    id: "WTE-TA-8305",
    name: "Tamanna Akther",
    department: "Administration",
    designation: "Human Resource (HR)",
    dob: "18 Oct 2001",
    sex: "Female",
    blood: "O+",
    joining: "01 Jul 2025",
    phone: "+880 1604-198305",
    email: "hr@wetraineducation.com",
    photo: `/our-teams/WTE-TA-8305.jpg`,
  },
  {
    id: "WTE-SH-7924",
    name: "Sagor Sharif",
    department: "Administration",
    designation: "Business Development Executive (BDE)",
    dob: "03 Jan 2004",
    sex: "Male",
    blood: "B+",
    joining: "01 Jul 2025",
    phone: "+880 1750-467924",
    email: "sagor@wetraineducation.com",
    photo: `/our-teams/WTE-SH-7924.jpg`,
  },
  {
    id: "WTE-AH-8814",
    name: "Ahsan Habib",
    department: "IT",
    designation: "Senior Developer",
    dob: "05 May 2004",
    sex: "Male",
    blood: "B+",
    joining: "01 Jul 2025",
    phone: "+880 1704-428814",
    email: "ahsan.habib@wetraineducation.com",
    photo: `/our-teams/WTE-AH-8814.jpg`,
  },
];

export const departments = [
  "Administration",
  "IT",
  "Customer Service",
  "Marketing",
];

export const getDepartmentIcon = (department: string) => {
  switch (department) {
    case "Administration":
      return "🏛️";
    case "Customer Service":
      return "🎧";
    case "Marketing":
      return "📈";
    case "IT":
      return "💻";
    default:
      return "👥";
  }
};
