import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Layout from "./Component/Layout/Layout";

import Home from "./Component/Home/Home";
import HomeStyle2 from "./Component/Home/HomeStyle2";
import HomeStyle3 from "./Component/Home/HomeStyle3";
import About from "./Component/About/About";
import Service from "./Component/Service/Service";
import ServiceStyle2 from "./Component/Service/ServiceStyle2";
import ServiceSingle from "./Component/Service/ServiceSingle";
import Shop from "./Component/Shop/Shop";
import ShopSingle from "./Component/Shop/ShopSingle";
import Blog from "./Component/Blog/Blog";
import BlogRightSidebar from "./Component/Blog/BlogRightSidebar";
import BlogLeftSidebar from "./Component/Blog/BlogLeftSidebar";
import BlogFullwidth from "./Component/Blog/BlogFullwidth";
import BlogDetails from "./Component/Blog/BlogDetails";
import BlogDetailsRightSidebar from "./Component/Blog/BlogDetailsRightSidebar";
import BlogDetailsLeftSidebar from "./Component/Blog/BlogDetailsLeftSidebar";
import BlogDetailsFullwidth from "./Component/Blog/BlogDetailsFullwidth";
import Contact from "./Component/Contact/Contact";
import Cart from "./Component/Cart/Cart";
import Checkout from "./Component/Checkout/Checkout";
import BookOnline from "./Component/BookOnline/BookOnline";

function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<Navigate to="/home/style-1" replace />} />
          <Route path="/home" element={<Navigate to="/home/style-1" replace />} />
          <Route path="/home/style-1" element={<Home />} />
          <Route path="/home/style-2" element={<HomeStyle2 />} />
          <Route path="/home/style-3" element={<HomeStyle3 />} />
          <Route path="/about" element={<About />} />
          <Route path="/service" element={<Navigate to="/service/style-1" replace />} />
          <Route path="/service/style-1" element={<Service />} />
          <Route path="/service/style-2" element={<ServiceStyle2 />} />
          <Route path="/service/single" element={<ServiceSingle />} />
          <Route path="/shop" element={<Shop />} />
          <Route path="/shop/single" element={<ShopSingle />} />
          <Route path="/checkout" element={<Checkout />} />

          <Route path="/blog" element={<Navigate to="/blog/right-sidebar" replace />} />
          <Route path="/blog/right-sidebar" element={<BlogRightSidebar />} />
          <Route path="/blog/left-sidebar" element={<BlogLeftSidebar />} />
          <Route path="/blog/fullwidth" element={<BlogFullwidth />} />
          <Route path="/blog/details" element={<BlogDetails />} />
          <Route path="/blog/details/right-sidebar" element={<BlogDetailsRightSidebar />} />
          <Route path="/blog/details/left-sidebar" element={<BlogDetailsLeftSidebar />} />
          <Route path="/blog/details/fullwidth" element={<BlogDetailsFullwidth />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/book-online" element={<BookOnline />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}

export default App;
