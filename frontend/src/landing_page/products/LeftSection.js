import React from 'react'

function LeftSection({ imageUrl, productName, productDescription, tryDemo, learnMore, googlePlay, appStore }) {
    return (
        <div className='container p-5 '>

            <div className='row p-5'>
                <div className='col-6 p-5'>
                    <img src={imageUrl} alt={productName} className='' style={{ width: "100%" ,height:"100%" }} />
                </div>

                <div className='col-6 p-3 mt-5'>
                    <h2 className=''>{productName}</h2>
                    <p className='text-muted fs-5 '>
                        {productDescription}
                    </p>

                    <div className='mt-4'>

                        <a href={tryDemo} className="" style={{ textDecoration: "none" }}>Try Demo&nbsp;<i class="fa fa-long-arrow-right" aria-hidden="true"></i>
                        </a>
                        <a href={learnMore} className="" style={{ textDecoration: "none" , marginLeft:"50px"}}>learn More&nbsp;<i class="fa fa-long-arrow-right" aria-hidden="true"></i>
                        </a>
                    </div>

                    <div className='mt-4'>


                        <br />
                        <a href={googlePlay} className="" style={{ textDecoration: "none" }}><img src="media/images/googlePlayBadge.svg" alt='' />&nbsp;
                        </a>
                        <a href={appStore} className="" style={{ textDecoration: "none" ,marginLeft:"20px" }}><img src="media/images/appstoreBadge.svg" alt='' />&nbsp;
                        </a>
                    </div>
                </div>

            </div>
        </div>
    );
}

export default LeftSection;