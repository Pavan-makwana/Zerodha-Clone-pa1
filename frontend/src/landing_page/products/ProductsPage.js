import React from 'react';
import LeftSection from './LeftSection';
import RightSection from './RightSection';
import Universe from './Universe';
import Hero from './Hero';

function ProductsPage() {
  return (
    <div> 
      <Hero />
      <LeftSection
        imageUrl="media/images/kite.png"
        productName="Kite" 
        productDescription="Our ultra-fast flagship trading platform with streaming market data, advanced charts, an elegant UI, and more. Enjoy the Kite experience seamlessly on your Android and iOS devices." 
        tryDemo="https://kite-demo.zerodha.com" 
        learnMore="/products" 
        googlePlay="https://play.google.com/store/apps/details?id=com.zerodha.kite3" 
        appStore="https://apps.apple.com/in/app/zerodha-kite-trade-invest/id1449453802"
      />

      <RightSection
        imageUrl="media/images/console.png"
        productName="Console" 
        productDescription="The central dashboard for your Zerodha account. Gain insights into your trades and investments with in-depth reports and visualisations."
        learnMore="https://console.zerodha.com"
      />

      <LeftSection
        imageUrl="media/images/coin.png"
        productName="Coin" 
        productDescription="Buy direct mutual funds online, commission-free, delivered directly to your Demat account. Enjoy the investment experience on your Android and iOS devices."
        tryDemo="https://coin.zerodha.com" 
        learnMore="/products" 
        googlePlay="https://play.google.com/store/apps/details?id=com.zerodha.coin" 
        appStore="https://apps.apple.com/in/app/coin-by-zerodha/id1392892554"
      />

      <RightSection
        imageUrl="media/images/kiteconnect.png"
        productName="Kite Connect API" 
        productDescription="Build powerful trading platforms and experiences with our super simple HTTP/JSON APIs. If you are a startup, build your investment app and showcase it to our clientbase."
        learnMore="https://kite.trade"
      />

      <LeftSection
        imageUrl="media/images/varsity.png"
        productName="Varsity mobile" 
        productDescription="An easy to grasp, collection of stock market lessons with in-depth coverage and illustrations. Round the clock market education on your Android and iOS devices." 
        tryDemo="https://zerodha.com/varsity" 
        learnMore="https://zerodha.com/varsity" 
        googlePlay="https://play.google.com/store/apps/details?id=com.zerodha.varsity" 
        appStore="https://apps.apple.com/in/app/varsity-by-zerodha/id1474205147"
      />

      <p className='text-center text-muted fs-5 mb-5'>
        Want to know more about our technology stack? Check out the <a href="https://zerodha.tech" target="_blank" rel="noopener noreferrer" style={{ textDecoration: "none" }}>Zerodha.tech</a> blog.
      </p>
      <Universe />
    </div>
  );
}

export default ProductsPage;
