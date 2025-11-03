//
//  HTKLineContainerView.swift
//  Base64
//
//  Created by hublot on 2020/8/26.
//

import UIKit

class HTKLineContainerView: UIView {
    
    var configManager = HTKLineConfigManager()
    
    @objc var onDrawItemDidTouch: RCTBubblingEventBlock?

    @objc var onScrollLeft: RCTBubblingEventBlock?

    @objc var onChartTouch: RCTBubblingEventBlock?

    @objc var onDrawItemComplete: RCTBubblingEventBlock?
    
    @objc var onDrawPointComplete: RCTBubblingEventBlock?
    
    @objc var optionList: String? {
        didSet {
            guard let optionList = optionList else {
                return
            }
            
            RNKLineView.queue.async { [weak self] in
                do {
                    guard let optionListData = optionList.data(using: .utf8),
                          let optionListDict = try JSONSerialization.jsonObject(with: optionListData, options: .allowFragments) as? [String: Any] else {
                        return
                    }
                    self?.configManager.reloadOptionList(optionListDict)
                    DispatchQueue.main.async {
                        guard let self = self else { return }
                        self.reloadConfigManager(self.configManager)
                    }
                } catch {
                    print("Error parsing optionList: \(error)")
                }
            }
        }
    }

    lazy var klineView: HTKLineView = {
        let klineView = HTKLineView.init(CGRect.zero, configManager)
        return klineView
    }()
    
    lazy var shotView: HTShotView = {
        let shotView = HTShotView.init(frame: CGRect.zero)
        shotView.dimension = 100
        return shotView
    }()

    func setupChildViews() {
        klineView.frame = bounds
        let superShotView = reactSuperview()?.reactSuperview()?.reactSuperview()
        superShotView?.reactSuperview()?.addSubview(shotView)
        shotView.shotView = superShotView
        shotView.reactSetFrame(CGRect.init(x: 50, y: 50, width: shotView.dimension, height: shotView.dimension))
    }

    override var frame: CGRect {
        didSet {
	        setupChildViews()
        }
    }
    
    override func reactSetFrame(_ frame: CGRect) {
        super.reactSetFrame(frame)
        setupChildViews()
    }
    
    override init(frame: CGRect) {
        super.init(frame: frame)
        addSubview(klineView)
    }
    
    required init?(coder: NSCoder) {
        fatalError("init(coder:) has not been implemented")
    }
    
    func reloadConfigManager(_ configManager: HTKLineConfigManager) {
        
        configManager.onDrawItemDidTouch = { [weak self] (drawItem, drawItemIndex) in
            self?.configManager.shouldReloadDrawItemIndex = drawItemIndex
            guard let drawItem = drawItem, let colorList = drawItem.drawColor.cgColor.components else {
                self?.onDrawItemDidTouch?([
                    "shouldReloadDrawItemIndex": drawItemIndex,
                ])
                return
            }
            self?.onDrawItemDidTouch?([
                "shouldReloadDrawItemIndex": drawItemIndex,
                "drawColor": colorList,
                "drawLineHeight": drawItem.drawLineHeight,
                "drawDashWidth": drawItem.drawDashWidth,
                "drawDashSpace": drawItem.drawDashSpace,
                "drawIsLock": drawItem.drawIsLock
            ])
        }
        configManager.onScrollLeft = { [weak self] (timestamp) in
            self?.onScrollLeft?([
                "timestamp": timestamp,
            ])
        }
        configManager.onChartTouch = { [weak self] (location, isOnClosePriceLabel) in
            guard let self = self else { return }

            // If touched on close price label, trigger smooth scroll to end
            if isOnClosePriceLabel {
                self.klineView.smoothScrollToEnd()
            }

            self.onChartTouch?([
                "x": location.x,
                "y": location.y,
                "isOnClosePriceLabel": isOnClosePriceLabel,
                "closePriceFrame": [
                    "x": self.klineView.closePriceLabelFrame.origin.x,
                    "y": self.klineView.closePriceLabelFrame.origin.y,
                    "width": self.klineView.closePriceLabelFrame.size.width,
                    "height": self.klineView.closePriceLabelFrame.size.height,
                ],
            ])
        }
        configManager.onDrawItemComplete = { [weak self] (drawItem, drawItemIndex) in
            self?.onDrawItemComplete?([AnyHashable: Any].init())
        }
        configManager.onDrawPointComplete = { [weak self] (drawItem, drawItemIndex) in
            guard let drawItem = drawItem else {
                return
            }
            self?.onDrawPointComplete?([
                "pointCount": drawItem.pointList.count
            ])
        }
        
        let reloadIndex = configManager.shouldReloadDrawItemIndex
        if reloadIndex >= 0, reloadIndex < klineView.drawContext.drawItemList.count {
            let drawItem = klineView.drawContext.drawItemList[reloadIndex]
            drawItem.drawColor = configManager.drawColor
            drawItem.drawLineHeight = configManager.drawLineHeight
            drawItem.drawDashWidth = configManager.drawDashWidth
            drawItem.drawDashSpace = configManager.drawDashSpace
            drawItem.drawIsLock = configManager.drawIsLock
            if (configManager.drawShouldTrash) {
                configManager.shouldReloadDrawItemIndex = HTDrawState.showPencil.rawValue
                klineView.drawContext.drawItemList.remove(at: reloadIndex)
                configManager.drawShouldTrash = false
            }
            klineView.drawContext.setNeedsDisplay()
        }
        
        klineView.reloadConfigManager(configManager)
        shotView.shotColor = configManager.shotBackgroundColor
        if configManager.shouldFixDraw {
            configManager.shouldFixDraw = false
            klineView.drawContext.fixDrawItemList()
        }
        if (configManager.shouldClearDraw) {
            configManager.drawType = .none
            configManager.shouldClearDraw = false
            klineView.drawContext.clearDrawItemList()
        }
    }
    
    private func convertLocation(_ location: CGPoint) -> CGPoint {
        var reloadLocation = location
        reloadLocation.x = max(min(reloadLocation.x, bounds.size.width), 0)
        reloadLocation.y = max(min(reloadLocation.y, bounds.size.height), 0)
//        reloadLocation.x += klineView.contentOffset.x
        reloadLocation = klineView.valuePointFromViewPoint(reloadLocation)
        return reloadLocation
    }
    
    override func hitTest(_ point: CGPoint, with event: UIEvent?) -> UIView? {
        let view = super.hitTest(point, with: event)
        if view == klineView {
            switch configManager.shouldReloadDrawItemIndex {
            case HTDrawState.none.rawValue:
                return view
            case HTDrawState.showPencil.rawValue:
                if configManager.drawType == .none {
                    if HTDrawItem.canResponseLocation(klineView.drawContext.drawItemList, convertLocation(point), klineView) != nil {
                        return self
                    } else {
                        return view
                    }
                } else {
                    return self
                }
            case HTDrawState.showContext.rawValue:
                return self
            default:
                return self
            }
        }
        return view
//        if view == drawView, configManager.enabledDraw == false {
//            return klineView
//        }
//        return view
    }
    
    override func touchesBegan(_ touches: Set<UITouch>, with event: UIEvent?) {
        touchesGesture(touches, .began)
    }
    
    override func touchesMoved(_ touches: Set<UITouch>, with event: UIEvent?) {
        touchesGesture(touches, .changed)
    }
    
    override func touchesEnded(_ touches: Set<UITouch>, with event: UIEvent?) {
        touchesGesture(touches, .ended)
    }
    
    override func touchesCancelled(_ touches: Set<UITouch>, with event: UIEvent?) {
        touchesEnded(touches, with: event)
    }
    
    func touchesGesture(_ touched: Set<UITouch>, _ state: UIGestureRecognizerState) {
        guard var location = touched.first?.location(in: self) else {
            shotView.shotPoint = nil
            return
        }
        var previousLocation = touched.first?.previousLocation(in: self) ?? location
        location = convertLocation(location)
        previousLocation = convertLocation(previousLocation)

        let translation = CGPoint.init(x: location.x - previousLocation.x, y: location.y - previousLocation.y)

        klineView.drawContext.touchesGesture(location, translation, state)
        shotView.shotPoint = state != .ended ? touched.first?.location(in: self) : nil
    }

    @objc func updateLastCandlestick(_ candlestick: NSDictionary) {
        print("HTKLineContainerView: updateLastCandlestick called with data: \(candlestick)")

        guard let candlestickDict = candlestick as? [String: Any],
              configManager.modelArray.count > 0 else {
            print("HTKLineContainerView: updateLastCandlestick - Null check failed or empty model array")
            return
        }

        do {
            // Get the existing last candlestick to preserve indicator data
            let lastIndex = configManager.modelArray.count - 1
            let existingModel = configManager.modelArray[lastIndex]

            // Create updated model with new indicator data from React Native
            let updatedModel = HTKLineModel.packModel(candlestickDict)

            print("HTKLineContainerView: Input vol field: \(candlestickDict["vol"] ?? "nil")")
            print("HTKLineContainerView: Created model with volume: \(updatedModel.volume)")

            // Only preserve indicator lists if the new data doesn't contain them
            print("HTKLineContainerView: Using new indicator data from React Native")
            if updatedModel.maList.isEmpty {
                updatedModel.maList = existingModel.maList
            }
            if updatedModel.maVolumeList.isEmpty {
                updatedModel.maVolumeList = existingModel.maVolumeList
            }
            if updatedModel.rsiList.isEmpty {
                updatedModel.rsiList = existingModel.rsiList
            }
            if updatedModel.wrList.isEmpty {
                updatedModel.wrList = existingModel.wrList
            }
            if updatedModel.selectedItemList.isEmpty {
                updatedModel.selectedItemList = existingModel.selectedItemList
            }

            print("HTKLineContainerView: New maVolumeList count: \(updatedModel.maVolumeList.count)")
            if !updatedModel.maVolumeList.isEmpty {
                print("HTKLineContainerView: Volume MA5: \(updatedModel.maVolumeList[0].value), MA10: \(updatedModel.maVolumeList[1].value)")
            }

            // Update the model array
            configManager.modelArray[lastIndex] = updatedModel

            print("HTKLineContainerView: Updated last candlestick at index \(lastIndex) with close: \(updatedModel.close)")
            print("HTKLineContainerView: Preserved maVolumeList count: \(updatedModel.maVolumeList.count)")

            // Force redraw without reloading the entire configuration
            DispatchQueue.main.async { [weak self] in
                print("HTKLineContainerView: Triggering redraw")
                self?.klineView.setNeedsDisplay()
            }
        } catch {
            print("HTKLineContainerView: Error updating last candlestick: \(error)")
        }
    }

    @objc func addCandlesticksAtTheEnd(_ candlesticks: NSArray) {
        print("HTKLineContainerView: addCandlesticksAtTheEnd called with \(candlesticks.count) candlesticks")

        guard let candlesticksArray = candlesticks as? [[String: Any]],
              !candlesticksArray.isEmpty else {
            print("HTKLineContainerView: addCandlesticksAtTheEnd - Invalid or empty candlesticks array")
            return
        }

        do {
            // Get template model for preserving indicator lists structure
            var templateModel: HTKLineModel? = nil
            if !configManager.modelArray.isEmpty {
                templateModel = configManager.modelArray.last
            }

            // Convert array of dictionaries to HTKLineModel array
            let newModels = HTKLineModel.packModelArray(candlesticksArray)

            if newModels.isEmpty {
                print("HTKLineContainerView: No valid models created from input data")
                return
            }

            // The indicator lists are now properly populated by packModelArray() from React Native data
            // No need for manual calculation since the data already includes calculated indicators
            for newModel in newModels {
                print("HTKLineContainerView: Using indicator data from React Native - maList.count=\(newModel.maList.count), maVolumeList.count=\(newModel.maVolumeList.count)")
            }

            // Get the scroll position before adding data
            let wasAtEnd = klineView.contentOffset.x >= (klineView.contentSize.width - klineView.frame.width - 10)

            // Add new models to the end of the array
            configManager.modelArray.append(contentsOf: newModels)

            print("HTKLineContainerView: Added \(newModels.count) new candlesticks to the end")
            print("HTKLineContainerView: Total candlesticks now: \(configManager.modelArray.count)")
            print("HTKLineContainerView: Was at end before adding: \(wasAtEnd)")

            // Force redraw and optionally scroll to end
            DispatchQueue.main.async { [weak self] in
                guard let self = self else { return }

                print("HTKLineContainerView: Reloading content size after adding candlesticks")
                self.klineView.reloadContentSize()

                print("HTKLineContainerView: Triggering redraw after adding candlesticks")
                self.klineView.setNeedsDisplay()

                // If user was at the end, keep them at the end
                if wasAtEnd {
                    DispatchQueue.main.asyncAfter(deadline: .now() + 0.1) {
                        print("HTKLineContainerView: Scrolling to end after adding new data")
                        let maxContentOffsetX = max(0, self.klineView.contentSize.width - self.klineView.bounds.size.width)
                        self.klineView.reloadContentOffset(maxContentOffsetX, true)
                    }
                }
            }
        } catch {
            print("HTKLineContainerView: Error adding candlesticks: \(error)")
        }
    }

    @objc func addCandlesticksAtTheStart(_ candlesticks: NSArray) {
        print("HTKLineContainerView: addCandlesticksAtTheStart called with \(candlesticks.count) candlesticks")

        guard let candlesticksArray = candlesticks as? [[String: Any]],
              !candlesticksArray.isEmpty else {
            print("HTKLineContainerView: addCandlesticksAtTheStart - Invalid or empty candlesticks array")
            return
        }

        do {
            // Convert array of dictionaries to HTKLineModel array
            let newModels = HTKLineModel.packModelArray(candlesticksArray)

            if newModels.isEmpty {
                print("HTKLineContainerView: No valid models created from input data")
                return
            }

            // The indicator lists are now properly populated by packModelArray() from React Native data
            for newModel in newModels {
                print("HTKLineContainerView: Using indicator data from React Native - maList.count=\(newModel.maList.count), maVolumeList.count=\(newModel.maVolumeList.count)")
            }

            // Get the current scroll position to maintain it after adding data at start
            let currentContentOffsetX = klineView.contentOffset.x

            // Add new models to the beginning of the array (prepend)
            configManager.modelArray.insert(contentsOf: newModels, at: 0)

            print("HTKLineContainerView: Added \(newModels.count) new candlesticks to the start")
            print("HTKLineContainerView: Total candlesticks now: \(configManager.modelArray.count)")

            // Reset the scroll left trigger flag to allow new triggers
            self.klineView.resetScrollLeftTrigger()

            // Force redraw and adjust scroll position
            DispatchQueue.main.async { [weak self] in
                guard let self = self else { return }

                print("HTKLineContainerView: Reloading content size after adding candlesticks at start")
                self.klineView.reloadContentSize()

                print("HTKLineContainerView: Triggering redraw after adding candlesticks at start")
                self.klineView.setNeedsDisplay()

                // Adjust scroll position to maintain the same view after prepending data
                DispatchQueue.main.asyncAfter(deadline: .now() + 0.1) {
                    let addedWidth = CGFloat(newModels.count) * self.configManager.itemWidth
                    let newContentOffsetX = currentContentOffsetX + addedWidth
                    print("HTKLineContainerView: Adjusting scroll position by \(addedWidth) pixels")
                    self.klineView.reloadContentOffset(newContentOffsetX, false)
                }
            }
        } catch {
            print("HTKLineContainerView: Error adding candlesticks at start: \(error)")
        }
    }

}

