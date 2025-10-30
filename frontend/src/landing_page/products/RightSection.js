function RightSection({imageUrl, productName, productDescription, learnMore}) {
    return ( 
        <div className='container p-5 '>

            <div className='row p-5 d-flex align-items-center'>
                

                <div className='col-6 p-3 '>
                    <h2 className=''>{productName}</h2>
                    <p className='text-muted fs-5 '>
                        {productDescription}
                    </p>

                    <div className=''>
                        <a href={learnMore} className="" style={{ textDecoration: "none"}}>Learn More&nbsp;<i class="fa fa-long-arrow-right" aria-hidden="true"></i>
                        </a>
                    </div>

                    
                </div>
                <div className='col-6 p-5'>
                    <img src={imageUrl} alt={productName} className='' style={{ width: "100%"  }} />
                </div>

            </div>
        </div>
     );
}

export default RightSection;