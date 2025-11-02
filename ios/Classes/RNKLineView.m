#import "RNKLineView-Swift.h"
#import "RCTViewManager.h"


@interface RCT_EXTERN_MODULE(RNKLineView, RCTViewManager)

RCT_EXPORT_VIEW_PROPERTY(onDrawItemDidTouch, RCTBubblingEventBlock)

RCT_EXPORT_VIEW_PROPERTY(onScrollLeft, RCTBubblingEventBlock)

RCT_EXPORT_VIEW_PROPERTY(onChartTouch, RCTBubblingEventBlock)

RCT_EXPORT_VIEW_PROPERTY(onDrawItemComplete, RCTBubblingEventBlock)

RCT_EXPORT_VIEW_PROPERTY(onDrawPointComplete, RCTBubblingEventBlock)

RCT_EXPORT_VIEW_PROPERTY(optionList, NSString)

RCT_EXTERN_METHOD(updateLastCandlestick:(nonnull NSNumber *)node
                  candlestick:(nonnull NSDictionary *)candlestick)

RCT_EXTERN_METHOD(addCandlesticksAtTheEnd:(nonnull NSNumber *)node
                  candlesticks:(nonnull NSArray *)candlesticks)

@end

