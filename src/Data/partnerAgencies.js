import mentorLogo from "../assets/mentorlogo.png";
import versusLogo from "../assets/versuslogo.png";
import athosLogo from "../assets/Athoslogo.png";
import allCruisesLogo from "../assets/allcruiseslogo.png";

/**
 * Partner travel agencies on the home page.
 * - `name`: shown in both languages (usually the official agency name).
 * - `website` (optional): full URL with https, or a domain like `example.gr` (https is added automatically).
 *   Omit or leave empty to show the name only (no link).
 * - `logo` (optional): bundled image shown above the name.
 */
export const partnerAgencies = [
  { name: "Mentor Travel", website: "https://www.mentortravel.gr", logo: mentorLogo },
  { name: "Versus Travel", website: "https://www.versustravel.eu", logo: versusLogo },
  { name: "Athos Hellas", website: "https://www.athoshellas.gr", logo: athosLogo },
  { name: "All Cruises", website: "https://allcruises.gr/en", logo: allCruisesLogo },
];
