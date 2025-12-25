import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faShoppingCart,
  faUser,
  faHeart,
  faStar,
  faTrash,
  faPlus,
  faMinus,
  faHome,
  faBox,
  faSignOutAlt,
  faSignInAlt,
  faUserPlus,
  faSearch,
  faFilter,
  faChevronRight,
  faChevronLeft,
  faCheck,
  faTimes,
  faEdit,
  faPhone,
  faEnvelope,
  faMapMarkerAlt,
  faCreditCard,
  faTruck,
  faShieldAlt,
  faUndo,
  faClock,
  faCheckCircle,
  faExclamationTriangle,
  faBars,
  faTimes as faClose,
  faShoppingBag,
  faTag,
  faGift,
  faHeadset
} from '@fortawesome/free-solid-svg-icons';
import { faHeart as faHeartRegular } from '@fortawesome/free-regular-svg-icons';

// Export FontAwesome component
export { FontAwesomeIcon };

// Export all icons
export const icons = {
  // Navigation
  home: faHome,
  products: faBox,
  cart: faShoppingCart,
  user: faUser,
  logout: faSignOutAlt,
  login: faSignInAlt,
  register: faUserPlus,
  
  // Actions
  heart: faHeart,
  heartRegular: faHeartRegular,
  star: faStar,
  trash: faTrash,
  plus: faPlus,
  minus: faMinus,
  edit: faEdit,
  search: faSearch,
  filter: faFilter,
  check: faCheck,
  times: faTimes,
  close: faClose,
  
  // Navigation arrows
  chevronRight: faChevronRight,
  chevronLeft: faChevronLeft,
  
  // Contact
  phone: faPhone,
  email: faEnvelope,
  location: faMapMarkerAlt,
  
  // Payment & Shipping
  creditCard: faCreditCard,
  truck: faTruck,
  shield: faShieldAlt,
  
  // Status
  clock: faClock,
  checkCircle: faCheckCircle,
  warning: faExclamationTriangle,
  undo: faUndo,
  
  // UI
  bars: faBars,
  shoppingBag: faShoppingBag,
  tag: faTag,
  gift: faGift,
  headset: faHeadset
};

