//
//  HTKLineViewManager.swift
//  Base64
//
//  Created by hublot on 2020/4/3.
//

import UIKit

@objc(RNKLineView)
@objcMembers
class RNKLineView: RCTViewManager {

    static let queue = DispatchQueue.init(label: "com.hublot.klinedata")

    override func view() -> UIView! {
        return HTKLineContainerView()
    }

    override class func requiresMainQueueSetup() -> Bool {
        return true
    }

    @objc func updateLastCandlestick(_ node: NSNumber, candlestick: NSDictionary) {
        print("RNKLineView: updateLastCandlestick called for node \(node) with data: \(candlestick)")
        DispatchQueue.main.async {
            guard let view = self.bridge?.uiManager.view(forReactTag: node) as? HTKLineContainerView else {
                print("RNKLineView: Could not find HTKLineContainerView for node \(node)")
                return
            }
            print("RNKLineView: Calling view.updateLastCandlestick")
            view.updateLastCandlestick(candlestick)
        }
    }

}
