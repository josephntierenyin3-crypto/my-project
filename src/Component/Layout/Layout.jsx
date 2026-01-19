import HeaderMiddle from "../HeaderMiddle/HeaderMiddle";
import HeaderUp from "../HeaderUp/HeaderUp";
import FooterOne from "../FooterOne/FooterOne";
import Footer from "../Footer/Footer";

const Layout = ({ children }) => {
  return (
    <>
      <HeaderUp />
      <HeaderMiddle />
      {children}
      <FooterOne />
      <Footer />
    </>
  );
};

export default Layout;
